import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(6).max(255).optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
