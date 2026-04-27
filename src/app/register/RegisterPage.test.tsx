import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vite-plus/test';

afterEach(() => {
  cleanup();
});
import RegisterPageClient from './RegisterPageClient';

const validFormData = {
  username: 'test_user',
  email: 'test@example.com',
  password: 'Password1',
  confirmPassword: 'Password1',
  fullName: '山田 太郎',
  dateOfBirth: '2000-01-01',
  phoneNumber: '090-1234-5678',
};

async function fillAndSubmitForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/ユーザー名/), validFormData.username);
  await user.type(screen.getByLabelText(/メールアドレス/), validFormData.email);
  await user.type(
    screen.getByLabelText(/^パスワード[^確]/),
    validFormData.password,
  );
  await user.type(
    screen.getByLabelText(/パスワード確認/),
    validFormData.confirmPassword,
  );
  await user.type(screen.getByLabelText(/氏名/), validFormData.fullName);
  await user.type(screen.getByLabelText(/生年月日/), validFormData.dateOfBirth);
  await user.type(screen.getByLabelText(/電話番号/), validFormData.phoneNumber);
  await user.click(screen.getByLabelText(/利用規約に同意します/));
  await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));
}

describe('RegisterPageClient', () => {
  test('初期状態でフォームが表示される', () => {
    render(<RegisterPageClient />);
    expect(
      screen.getByRole('button', { name: 'アカウントを作成' }),
    ).toBeInTheDocument();
  });

  test('送信後にサクセスパネルが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterPageClient />);

    await fillAndSubmitForm(user);

    await waitFor(() => {
      expect(screen.getByText('登録が完了しました')).toBeInTheDocument();
    });
  });

  test('サクセスパネルに送信したユーザー名とメールが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterPageClient />);

    await fillAndSubmitForm(user);

    await waitFor(() => {
      expect(screen.getByText(validFormData.username)).toBeInTheDocument();
      expect(screen.getByText(validFormData.email)).toBeInTheDocument();
    });
  });

  test('サクセスパネルの「戻る」ボタンでフォームに戻れる', async () => {
    const user = userEvent.setup();
    render(<RegisterPageClient />);

    await fillAndSubmitForm(user);

    await waitFor(() => {
      expect(screen.getByText('登録が完了しました')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: '別のアカウントを登録する' }),
    );

    expect(
      screen.getByRole('button', { name: 'アカウントを作成' }),
    ).toBeInTheDocument();
  });
});
