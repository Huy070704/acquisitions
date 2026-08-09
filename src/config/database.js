import { neon, neonConfig } from '@neondatabase/serverless';
// Adapter của Drizzle ORM giúp biến các câu lệnh JavaScript/TypeScript thành SQL chuẩn để gửi qua driver Neon.
import { drizzle } from 'drizzle-orm/neon-http';

if (process.env.NODE_ENV === 'development') {
  // Thay vì gửi trực tiếp lên Neon Cloud thật trên internet, driver Neon sẽ gửi request đến container local có tên là neon-local ở cổng 5432.
  //  Nhờ vậy bạn có thể làm việc offline / local mà không tốn tài nguyên cloud hay sợ làm hỏng dữ liệu thật.
  // Doan tac gia xu ly bi loi o sign up
  neonConfig.fetchEndpoint = () => {
    return `http://neon-local:5432/sql`;
  };
}

// Khởi tạo Client Neon kết nối với DATABASE_URL
const sql = neon(process.env.DATABASE_URL);

// "Hãy sử dụng client sql để giao tiếp với PostgreSQL." nhu mongodb
const db = drizzle(sql);

export { db, sql };
