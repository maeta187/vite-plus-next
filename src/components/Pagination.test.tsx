import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vite-plus/test';
import { getPaginationRange, Pagination } from './Pagination';

afterEach(() => {
  cleanup();
});

describe('getPaginationRange', () => {
  test('totalPages<=7 の場合は全ページを返す', () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test('currentPage=1, totalPages=52', () => {
    expect(getPaginationRange(1, 52)).toEqual([1, 2, '...', 52]);
  });

  test('currentPage=27, totalPages=52', () => {
    expect(getPaginationRange(27, 52)).toEqual([
      1,
      '...',
      26,
      27,
      28,
      '...',
      52,
    ]);
  });

  test('currentPage=52, totalPages=52', () => {
    expect(getPaginationRange(52, 52)).toEqual([1, '...', 51, 52]);
  });

  test('隠れ区間の長さが1の場合は"..."を使わず数字を表示する（currentPage=4, totalPages=9）', () => {
    expect(getPaginationRange(4, 9)).toEqual([1, 2, 3, 4, 5, '...', 9]);
  });
});

describe('Pagination', () => {
  test('(1,5) で 1〜5 のリンクが描画される', () => {
    render(<Pagination currentPage={1} totalPages={5} />);
    for (const page of [1, 2, 3, 4, 5]) {
      expect(
        screen.getByRole('link', { name: String(page) }),
      ).toBeInTheDocument();
    }
  });

  test('現在ページに aria-current="page" が付与される', () => {
    render(<Pagination currentPage={3} totalPages={5} />);
    const currentLink = screen.getByRole('link', { name: '3' });
    expect(currentLink).toHaveAttribute('aria-current', 'page');

    const otherLink = screen.getByRole('link', { name: '2' });
    expect(otherLink).not.toHaveAttribute('aria-current');
  });

  test('href が ?page=n 形式になっている', () => {
    render(<Pagination currentPage={1} totalPages={5} />);
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
      'href',
      '?page=3',
    );
  });

  test('"..." はリンクではなく装飾用の span として描画される', () => {
    render(<Pagination currentPage={1} totalPages={52} />);
    const ellipses = screen.getAllByText('...');
    for (const ellipsis of ellipses) {
      expect(ellipsis.tagName).toBe('SPAN');
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
    }
    expect(screen.queryByRole('link', { name: '...' })).not.toBeInTheDocument();
  });

  test('nav に aria-label="ページネーション" が付与される', () => {
    render(<Pagination currentPage={1} totalPages={5} />);
    expect(
      screen.getByRole('navigation', { name: 'ページネーション' }),
    ).toBeInTheDocument();
  });
});
