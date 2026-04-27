'use client';

import { useState } from 'react';
import RegisterForm from '@/components/RegisterForm';
import type { RegisterFormData } from '@/lib/schemas/register';

export default function RegisterPageClient() {
  const [submitted, setSubmitted] = useState<RegisterFormData | null>(null);

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            登録が完了しました
          </h2>
        </div>

        <dl className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
          {(
            [
              ['ユーザー名', submitted.username],
              ['メールアドレス', submitted.email],
              ['氏名', submitted.fullName],
              ['生年月日', submitted.dateOfBirth.toLocaleDateString('ja-JP')],
              ['電話番号', submitted.phoneNumber],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="flex px-4 py-3 text-sm">
              <dt className="w-36 shrink-0 font-medium text-zinc-500 dark:text-zinc-400">
                {label}
              </dt>
              <dd className="text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={() => setSubmitted(null)}
          className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-foreground hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          別のアカウントを登録する
        </button>
      </div>
    );
  }

  return <RegisterForm onSubmit={setSubmitted} />;
}
