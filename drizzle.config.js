// doc file env
import 'dotenv/config';

export default {
  schema: './src/models/*.js', // Đường dẫn chứa các Model định nghĩa bảng
  out: './drizzle', // Thư mục chứa các file SQL Migration được sinh ra
  dialect: 'postgresql', // Hệ quản trị CSDL sử dụng
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
