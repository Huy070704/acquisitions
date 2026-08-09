import aj from '#config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  try {
    // 1. Lấy role của user từ req.user (nếu có), mặc định là 'guest'
    const role = req.user?.role || 'guest';
    let limit;
    let message;

    // 2. Thiết lập hạn ngạch giới hạn request theo Role người dùng
    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request limit exceeded (20 per minute). Slow down!';
        break;
      case 'user':
        limit = 10;
        message = 'User request limit exceeded (10 per minute). Slow down!';
        break;
      default: // guest
        limit = 5;
        message = 'Guest request limit exceeded (5 per minute). Slow down!';
    }

    // 3. Khởi tạo client Arcjet linh hoạt theo từng Rule thiết lập cho Role đó
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    // 4. Kiểm tra Request thông qua Arcjet client
    const decision = await client.protect(req);

    // 5. Kiểm tra nếu Request bị từ chối
    if (decision.isDenied()) {
      // Bị chặn vì là BOT độc hại
      if (decision.reason.isBot()) {
        logger.warn('Bot request blocked', {
          ip: req.ip,
          userAgent: req.get('user-agent'),
          path: req.path,
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Automated requests are not allowed',
        });
      }

      // Bị chặn bởi Shield (SQL Injection, XSS, OWASP attacks)
      if (decision.reason.isShield()) {
        logger.warn('Shield blocked request', {
          ip: req.ip,
          userAgent: req.get('user-agent'),
          path: req.path,
          method: req.method,
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Request blocked by security policy',
        });
      }

      // Bị chặn do vượt quá Rate Limit (Spam/Overuse)
      if (decision.reason.isRateLimit()) {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('user-agent'),
          path: req.path,
        });
        return res.status(429).json({
          error: 'Too Many Requests',
          message: message || 'Too many requests',
        });
      }
    }

    // 6. Nếu an toàn -> Chuyển tiếp cho các handler/controller tiếp theo
    next();
  } catch (error) {
    console.error('Arcjet middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong with security middleware',
    });
  }
};

export default securityMiddleware;
