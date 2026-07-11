import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vite-plus/test';
import RegisterForm from './RegisterForm';

afterEach(() => {
  cleanup();
});

describe('RegisterForm', () => {
  test('空送信時に必須フィールドにエラーが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

    await waitFor(() => {
      expect(
        screen.getByText('ユーザー名は3文字以上で入力してください'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('有効なメールアドレスを入力してください'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('パスワードは8文字以上で入力してください'),
      ).toBeInTheDocument();
      expect(screen.getByText('氏名を入力してください')).toBeInTheDocument();
      expect(
        screen.getByText('生年月日を入力してください'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          '有効な電話番号を入力してください（例: 090-1234-5678 または 09012345678）',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('利用規約への同意が必要です'),
      ).toBeInTheDocument();
    });
  });

  test('パスワードとパスワード確認が一致しない場合エラーが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/^パスワード[^確]/), 'Password1');
    await user.type(screen.getByLabelText(/パスワード確認/), 'Password2');
    await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

    await waitFor(() => {
      expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
    });
  });

  test('電話番号のフォーマットが不正な場合エラーが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/電話番号/), '12345');
    await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

    await waitFor(() => {
      expect(
        screen.getByText(
          '有効な電話番号を入力してください（例: 090-1234-5678 または 09012345678）',
        ),
      ).toBeInTheDocument();
    });
  });

  test('生年月日が18歳未満の場合エラーが表示される', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const under18Date = new Date();
    under18Date.setFullYear(under18Date.getFullYear() - 10);
    const [year, month, day] = [
      under18Date.getFullYear(),
      String(under18Date.getMonth() + 1).padStart(2, '0'),
      String(under18Date.getDate()).padStart(2, '0'),
    ];

    await user.type(
      screen.getByLabelText(/生年月日/),
      `${year}-${month}-${day}`,
    );
    await user.click(screen.getByRole('button', { name: 'アカウントを作成' }));

    await waitFor(() => {
      expect(
        screen.getByText('18歳以上である必要があります'),
      ).toBeInTheDocument();
    });
  });
});
