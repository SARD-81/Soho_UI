import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'نام کاربری باید حداقل 3 کاراکتر باشد' })
    .max(50, { message: 'نام کاربری نمی‌تواند بیشتر از 50 کاراکتر باشد' }),
  password: z
    .string()
    .min(3, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
    .max(100, { message: 'رمز عبور نمی‌تواند بیشتر از 100 کاراکتر باشد' }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
