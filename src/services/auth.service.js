import bcrypt from 'bcrypt';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import logger from '#config/logger.js';
import { db } from '#config/database.js';
export const hashPassword = async password => {
  try {
    // Mã hóa mật khẩu với 10 vòng mã hóa (salt rounds)
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Error hashing password');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    // 1. Kiểm tra xem Email đã tồn tại trong Database hay chưa
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Nếu email đã tồn tại, tung ra lỗi nghiệp vụ
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    // 2. Tiến hành mã hóa mật khẩu
    const passwordHash = await hashPassword(password);

    // 3. Chèn người dùng mới vào bảng `users` trong CSDL
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: passwordHash,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    // Ghi log thông tin tạo thành công
    logger.info(`User with email: ${email} created successfully`);

    // 4. Trả về thông tin người dùng vừa được tạo
    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = existingUser[0];
    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      throw new Error('Invalid credentials');
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  } catch (error) {
    logger.error('Error authenticating user:', error);
    throw error;
  }
};
