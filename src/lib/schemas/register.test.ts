import { describe, expect, test } from 'vite-plus/test';
import { registerSchema } from './register';

const validData = {
  username: 'test_user1',
  email: 'user@example.com',
  password: 'Password1',
  confirmPassword: 'Password1',
  fullName: '山田 太郎',
  dateOfBirth: new Date('2000-01-01'),
  phoneNumber: '090-1234-5678',
  agreeToTerms: true,
};

describe('registerSchema', () => {
  describe('正常系', () => {
    test('全フィールドが有効な場合、成功する', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('username', () => {
    test('3文字は有効', () => {
      expect(
        registerSchema.safeParse({ ...validData, username: 'abc' }).success,
      ).toBe(true);
    });
    test('20文字は有効', () => {
      expect(
        registerSchema.safeParse({ ...validData, username: 'a'.repeat(20) })
          .success,
      ).toBe(true);
    });
    test('2文字は無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, username: 'ab' }).success,
      ).toBe(false);
    });
    test('21文字は無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, username: 'a'.repeat(21) })
          .success,
      ).toBe(false);
    });
    test('アンダースコアは有効', () => {
      expect(
        registerSchema.safeParse({ ...validData, username: 'test_user' })
          .success,
      ).toBe(true);
    });
    test('ハイフンは無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, username: 'test-user' })
          .success,
      ).toBe(false);
    });
    test('スペースは無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, username: 'test user' })
          .success,
      ).toBe(false);
    });
    test('日本語は無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, username: 'テスト123' })
          .success,
      ).toBe(false);
    });
  });

  describe('email', () => {
    test('有効なメールアドレス', () => {
      expect(
        registerSchema.safeParse({ ...validData, email: 'foo@bar.co.jp' })
          .success,
      ).toBe(true);
    });
    test('@なしは無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, email: 'notanemail' }).success,
      ).toBe(false);
    });
    test('ドメインなしは無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, email: 'user@' }).success,
      ).toBe(false);
    });
  });

  describe('password', () => {
    test('8文字・英数字混在は有効', () => {
      expect(
        registerSchema.safeParse({
          ...validData,
          password: 'Pass1234',
          confirmPassword: 'Pass1234',
        }).success,
      ).toBe(true);
    });
    test('7文字は無効', () => {
      expect(
        registerSchema.safeParse({
          ...validData,
          password: 'Pass123',
          confirmPassword: 'Pass123',
        }).success,
      ).toBe(false);
    });
    test('数字のみは無効', () => {
      expect(
        registerSchema.safeParse({
          ...validData,
          password: '12345678',
          confirmPassword: '12345678',
        }).success,
      ).toBe(false);
    });
    test('英字のみは無効', () => {
      expect(
        registerSchema.safeParse({
          ...validData,
          password: 'password',
          confirmPassword: 'password',
        }).success,
      ).toBe(false);
    });
  });

  describe('confirmPassword', () => {
    test('パスワードと一致する場合は有効', () => {
      expect(
        registerSchema.safeParse({
          ...validData,
          password: 'Pass1234',
          confirmPassword: 'Pass1234',
        }).success,
      ).toBe(true);
    });
    test('パスワードと不一致の場合は confirmPassword にエラーが乗る', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'Pass1234',
        confirmPassword: 'Other5678',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find(
          (i) => i.path[0] === 'confirmPassword',
        );
        expect(confirmError).toBeDefined();
      }
    });
  });

  describe('fullName', () => {
    test('1文字は有効', () => {
      expect(
        registerSchema.safeParse({ ...validData, fullName: '山' }).success,
      ).toBe(true);
    });
    test('50文字は有効', () => {
      expect(
        registerSchema.safeParse({ ...validData, fullName: '山'.repeat(50) })
          .success,
      ).toBe(true);
    });
    test('空文字は無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, fullName: '' }).success,
      ).toBe(false);
    });
    test('51文字は無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, fullName: '山'.repeat(51) })
          .success,
      ).toBe(false);
    });
  });

  describe('dateOfBirth', () => {
    test('18歳ちょうどは有効', () => {
      const today = new Date();
      const dob = new Date(today);
      dob.setFullYear(dob.getFullYear() - 18);
      expect(
        registerSchema.safeParse({ ...validData, dateOfBirth: dob }).success,
      ).toBe(true);
    });
    test('18歳未満は無効', () => {
      const today = new Date();
      const dob = new Date(today);
      dob.setFullYear(dob.getFullYear() - 18);
      dob.setDate(dob.getDate() + 1);
      expect(
        registerSchema.safeParse({ ...validData, dateOfBirth: dob }).success,
      ).toBe(false);
    });
    test('未来の日付は無効', () => {
      expect(
        registerSchema.safeParse({
          ...validData,
          dateOfBirth: new Date('2030-01-01'),
        }).success,
      ).toBe(false);
    });
    test('未入力はバリデーションエラーになる', () => {
      const result = registerSchema.safeParse({
        ...validData,
        dateOfBirth: null,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (i) => i.path[0] === 'dateOfBirth',
        );
        expect(error?.message).toBe('生年月日を入力してください');
      }
    });
    test('無効な日付はバリデーションエラーになる', () => {
      const result = registerSchema.safeParse({
        ...validData,
        dateOfBirth: new Date(''),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (i) => i.path[0] === 'dateOfBirth',
        );
        expect(error?.message).toBe('生年月日を入力してください');
      }
    });
  });

  describe('phoneNumber', () => {
    test('090-1234-5678 は有効', () => {
      expect(
        registerSchema.safeParse({ ...validData, phoneNumber: '090-1234-5678' })
          .success,
      ).toBe(true);
    });
    test('03-1234-5678 は有効（固定電話）', () => {
      expect(
        registerSchema.safeParse({ ...validData, phoneNumber: '03-1234-5678' })
          .success,
      ).toBe(true);
    });
    test('011-123-4567 は有効（市外3桁）', () => {
      expect(
        registerSchema.safeParse({ ...validData, phoneNumber: '011-123-4567' })
          .success,
      ).toBe(true);
    });
    test('ハイフンなし携帯番号は有効', () => {
      expect(
        registerSchema.safeParse({ ...validData, phoneNumber: '09012345678' })
          .success,
      ).toBe(true);
    });
    test('ハイフンなし固定電話は有効', () => {
      expect(
        registerSchema.safeParse({ ...validData, phoneNumber: '0312345678' })
          .success,
      ).toBe(true);
    });
    test('国際番号形式は無効', () => {
      expect(
        registerSchema.safeParse({
          ...validData,
          phoneNumber: '+81-90-1234-5678',
        }).success,
      ).toBe(false);
    });
  });

  describe('agreeToTerms', () => {
    test('true は有効', () => {
      expect(
        registerSchema.safeParse({ ...validData, agreeToTerms: true }).success,
      ).toBe(true);
    });
    test('false は無効', () => {
      expect(
        registerSchema.safeParse({ ...validData, agreeToTerms: false }).success,
      ).toBe(false);
    });
  });
});
