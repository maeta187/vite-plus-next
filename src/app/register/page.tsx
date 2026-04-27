import type { Metadata } from 'next';
import RegisterPageClient from './RegisterPageClient';

export const metadata: Metadata = {
  title: 'アカウント作成',
  description: '新しいアカウントを作成します',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-lg px-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
            アカウント作成
          </h1>
          <p className="mb-8 text-sm text-zinc-500">
            以下のフォームにご記入ください。
            <span className="text-red-500"> *</span> は必須項目です。
          </p>
          <RegisterPageClient />
        </div>
      </div>
    </main>
  );
}
