import { z } from 'zod';
import { containsPersianCharacters } from '../utils/text';

const USERNAME_PATTERN = /^[a-z][a-z0-9]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_SPECIAL_CHAR_PATTERN = /[^A-Za-z0-9]/;

const baseCreateWebUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { message: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' })
    .max(150, { message: 'نام کاربری نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.' })
    .refine((value) => !containsPersianCharacters(value), {
      message: 'استفاده از حروف فارسی در این فیلد مجاز نیست.',
    })
    .refine((value) => USERNAME_PATTERN.test(value), {
      message:
        'نام کاربری فقط می‌تواند شامل حروف انگلیسی کوچک و اعداد باشد و نباید با عدد شروع شود.',
    }),
  email: z
    .string()
    .trim()
    .max(254, { message: 'ایمیل نمی‌تواند بیشتر از ۲۵۴ کاراکتر باشد.' })
    .refine((value) => !containsPersianCharacters(value), {
      message: 'استفاده از حروف فارسی در این فیلد مجاز نیست.',
    })
    .refine((value) => value.length === 0 || EMAIL_PATTERN.test(value), {
      message: 'ایمیل وارد شده معتبر نیست.',
    }),
  password: z
    .string()
    .min(8, { message: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' })
    // .max(128, { message: 'رمز عبور نمی‌تواند بیشتر از ۱۲۸ کاراکتر باشد.' })
    .refine((value) => !containsPersianCharacters(value), {
      message: 'استفاده از حروف فارسی در این فیلد مجاز نیست.',
    })
    .refine((value) => PASSWORD_SPECIAL_CHAR_PATTERN.test(value), {
      message: 'رمز عبور باید حداقل شامل یک کاراکتر خاص باشد.',
    }),
  is_superuser: z.boolean(),
  first_name: z
    .string()
    .max(150, { message: 'نام نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.' })
    .optional(),
  last_name: z
    .string()
    .max(150, { message: 'نام خانوادگی نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد.' })
    .optional(),
});

export type CreateWebUserFormValues = z.infer<typeof baseCreateWebUserSchema>;

interface CreateWebUserSchemaOptions {
  existingUsernames?: Iterable<string>;
}

export const createWebUserSchema = ({
  existingUsernames = [],
}: CreateWebUserSchemaOptions = {}) => {
  const normalizedUsernames = new Set(
    Array.from(existingUsernames, (name) => name.trim().toLowerCase()).filter(
      (name) => name.length > 0
    )
  );

  return baseCreateWebUserSchema.superRefine((data, ctx) => {
    const normalizedUsername = data.username.trim().toLowerCase();

    if (normalizedUsername === 'admin') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ایجاد کاربر مدیر جدید مجاز نیست.',
        path: ['username'],
      });
    }

    if (normalizedUsernames.has(normalizedUsername)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'کاربری با این نام کاربری از قبل وجود دارد.',
        path: ['username'],
      });
    }
  });
};