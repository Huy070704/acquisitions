import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import logger from '#config/logger.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    // Truy vấn dữ liệu và chọn lọc các trường an toàn
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    return allUsers;
  } catch (error) {
    logger.error('Error getting users:', error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return userList[0];
  } catch (error) {
    logger.error(`Error getting user by id ${id}:`, error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUserList = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUserList[0];
  } catch (error) {
    logger.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    const existingUser = await getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    await db.delete(users).where(eq(users.id, id));
    return true;
  } catch (error) {
    logger.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};
