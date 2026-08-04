import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

// Lấy mã bí mật từ biến môi trường, hoặc dùng giá trị mặc định khi chạy Dev
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-please-change-in-production';
const JWT_EXPIRES_IN = '1d'; // Thời gian hết hạn của Token (1 ngày)

export const JWT = {
  /**
   * Tạo (ký) chuỗi JWT Token từ dữ liệu người dùng (payload)
   * @param {Object} payload - Dữ liệu muốn lưu trong token (ví dụ: { id, email, role })
   * @returns {string} Chuỗi JWT Token đã mã hóa
   */
  sign: payload => {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
    } catch (error) {
      logger.error('Failed to authenticate token:', error);
      throw error;
    }
  },

  /**
   * Giải mã và xác thực tính hợp lệ của JWT Token
   * @param {string} token - Chuỗi JWT Token gửi lên từ client
   * @returns {Object} Dữ liệu payload đã được giải mã nếu token hợp lệ
   */
  verify: token => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Failed to authenticate token:', error);
      throw error;
    }
  },
};
