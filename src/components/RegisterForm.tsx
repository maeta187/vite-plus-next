'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  registerSchema,
  type RegisterFormData,
  type RegisterFormInput,
} from '@/lib/schemas/register';

type Props = {
  onSubmit?: (data: RegisterFormData) => void | Promise<void>;
};

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

function Field({ id, label, error, required = true, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  'mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500';

export default function RegisterForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput, unknown, RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeToTerms: false },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => onSubmit?.(data))}
      noValidate
      className="space-y-5"
    >
      <Field id="username" label="ユーザー名" error={errors.username?.message}>
        <input
          id="username"
          type="text"
          autoComplete="username"
          aria-describedby={errors.username ? 'username-error' : undefined}
          aria-invalid={!!errors.username}
          className={inputClass}
          {...register('username')}
        />
      </Field>

      <Field id="email" label="メールアドレス" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
          className={inputClass}
          {...register('email')}
        />
      </Field>

      <Field id="password" label="パスワード" error={errors.password?.message}>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-describedby={errors.password ? 'password-error' : undefined}
          aria-invalid={!!errors.password}
          className={inputClass}
          {...register('password')}
        />
      </Field>

      <Field
        id="confirmPassword"
        label="パスワード確認"
        error={errors.confirmPassword?.message}
      >
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-describedby={
            errors.confirmPassword ? 'confirmPassword-error' : undefined
          }
          aria-invalid={!!errors.confirmPassword}
          className={inputClass}
          {...register('confirmPassword')}
        />
      </Field>

      <Field id="fullName" label="氏名" error={errors.fullName?.message}>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          aria-invalid={!!errors.fullName}
          className={inputClass}
          {...register('fullName')}
        />
      </Field>

      <Field
        id="dateOfBirth"
        label="生年月日"
        error={errors.dateOfBirth?.message}
      >
        <input
          id="dateOfBirth"
          type="date"
          aria-describedby={
            errors.dateOfBirth ? 'dateOfBirth-error' : undefined
          }
          aria-invalid={!!errors.dateOfBirth}
          className={inputClass}
          {...register('dateOfBirth', { valueAsDate: true })}
        />
      </Field>

      <Field
        id="phoneNumber"
        label="電話番号"
        error={errors.phoneNumber?.message}
      >
        <input
          id="phoneNumber"
          type="tel"
          autoComplete="tel"
          placeholder="090-1234-5678"
          aria-describedby={
            errors.phoneNumber ? 'phoneNumber-error' : undefined
          }
          aria-invalid={!!errors.phoneNumber}
          className={inputClass}
          {...register('phoneNumber')}
        />
      </Field>

      <div>
        <div className="flex items-start gap-2">
          <input
            id="agreeToTerms"
            type="checkbox"
            aria-describedby={
              errors.agreeToTerms ? 'agreeToTerms-error' : undefined
            }
            aria-invalid={!!errors.agreeToTerms}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300"
            {...register('agreeToTerms')}
          />
          <label htmlFor="agreeToTerms" className="text-sm text-foreground">
            利用規約に同意します
            <span aria-hidden="true" className="ml-1 text-red-500">
              *
            </span>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p
            id="agreeToTerms-error"
            role="alert"
            className="mt-1 text-xs text-red-500"
          >
            {errors.agreeToTerms.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? '登録中...' : 'アカウントを作成'}
      </button>
    </form>
  );
}
