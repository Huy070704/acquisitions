import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Khởi tạo Client Neon kết nối với DATABASE_URL
const sql = neon(process.env.DATABASE_URL);

// "Hãy sử dụng client sql để giao tiếp với PostgreSQL." nhu mongodb
const db = drizzle(sql);

export { db, sql };
