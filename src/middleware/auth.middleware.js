import { JWT } from '#utils/jwt.js';
import logger from '#config/logger.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'No token provided' });
    }

    const user = JWT.verify(token);
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

export const requireRole = roles => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};
