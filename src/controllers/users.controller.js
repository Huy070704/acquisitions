import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import logger from '#config/logger.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';
import { JWT } from '#utils/jwt.js';
import { formatValidationError } from '../utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');

    // Gọi tầng service để lấy dữ liệu
    const allUsers = await getAllUsers();

    // Trả về JSON cho Client
    return res.status(200).json({
      message: 'Successfully retrieved users',
      users: allUsers,
      userCount: allUsers.length,
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Invalid ID',
        details: formatValidationError(idValidation.error),
      });
    }
    const { id } = idValidation.data;
    logger.info(`Getting user by ID: ${id}`);

    const user = await getUserByIdService(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Invalid ID',
        details: formatValidationError(idValidation.error),
      });
    }
    const { id } = idValidation.data;

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }

    // Auth check
    const authUser = req.user;

    if (authUser.id !== id && authUser.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Forbidden: You can only update your own information' });
    }

    const updates = bodyValidation.data;

    if (updates.role && authUser.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Forbidden: Only admins can change roles' });
    }

    logger.info(`Updating user ID: ${id}`);

    let updatedUser;
    try {
      updatedUser = await updateUserService(id, updates);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw error;
    }

    return res.status(200).json({
      message: 'Successfully updated user',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Invalid ID',
        details: formatValidationError(idValidation.error),
      });
    }
    const { id } = idValidation.data;

    // Auth check handled by requireRole(['admin']) middleware

    logger.info(`Deleting user ID: ${id}`);

    try {
      await deleteUserService(id);
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw error;
    }

    return res.status(200).json({
      message: 'Successfully deleted user',
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};
