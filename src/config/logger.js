import winston from 'winston';

// Định nghĩa đối tượng logger
const logger = winston.createLogger({
  // Mức độ log lấy từ môi trường (.env) hoặc mặc định là 'info'
  level: process.env.LOG_LEVEL || 'info',

  // Cấu hình định dạng của log
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Ghi lại đầy đủ Stack Trace khi có lỗi
    winston.format.json() // Đưa log về dạng chuẩn JSON
  ),

  // Thông tin thuộc tính mặc định đính kèm vào mỗi dòng log
  defaultMeta: { service: 'acquisitions-api' },

  // Nơi lưu trữ nhật ký log
  transports: [
    // 1. Chỉ lưu các log mức độ ERROR vào file error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // 2. Lưu TẤT CẢ các log vào file combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Nếu không phải môi trường Production, in thêm log ra Console/Terminal với định dạng có màu
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Tô màu theo mức độ log (info: xanh, error: đỏ, warn: vàng)
        winston.format.simple() // Hiển thị dạng dòng chữ đơn giản dễ đọc khi làm việc
      ),
    })
  );
}

export default logger;
