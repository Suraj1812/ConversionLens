import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(320, 'Email is too long')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long')
});
