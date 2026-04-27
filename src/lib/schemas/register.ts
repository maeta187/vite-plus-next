import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'ユーザー名は3文字以上で入力してください')
      .max(20, 'ユーザー名は20文字以内で入力してください')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'ユーザー名は英数字とアンダースコアのみ使用できます',
      ),

    email: z.string().email('有効なメールアドレスを入力してください'),

    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください')
      .refine(
        (val) => /[a-zA-Z]/.test(val) && /\d/.test(val),
        'パスワードは英字と数字を両方含める必要があります',
      ),

    confirmPassword: z.string(),

    fullName: z
      .string()
      .min(1, '氏名を入力してください')
      .max(50, '氏名は50文字以内で入力してください'),

    dateOfBirth: z
      .union([z.instanceof(Date), z.null()])
      .refine(
        (d): d is Date => d !== null && !isNaN(d.getTime()),
        '生年月日を入力してください',
      )
      .refine((date) => {
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 18);
        return date <= cutoff;
      }, '18歳以上である必要があります')
      .refine(
        (date) => date <= new Date(),
        '生年月日は過去の日付を入力してください',
      ),

    phoneNumber: z
      .string()
      .regex(
        /^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10})$/,
        '有効な電話番号を入力してください（例: 090-1234-5678 または 09012345678）',
      ),

    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, '利用規約への同意が必要です'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'パスワードが一致しません',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
