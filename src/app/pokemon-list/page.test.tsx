import { cleanup, render, screen } from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vite-plus/test';
import type { PokemonDetail, PokemonListResponse } from '@/lib/pokemon/types';
import PokemonListPage from './page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const TOTAL_COUNT = 1025; // -> totalPages = Math.ceil(1025 / 20) = 52

function makeListResponse(): PokemonListResponse {
  const results = Array.from({ length: 20 }, (_, i) => ({
    name: `pokemon-${i + 1}`,
    url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
  }));
  return { count: TOTAL_COUNT, next: null, previous: null, results };
}

function makeDetail(id: number): PokemonDetail {
  return {
    id,
    name: `pokemon-${id}`,
    sprites: {
      other: {
        'official-artwork': {
          front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/${id}.png`,
        },
      },
    },
    types: [{ slot: 1, type: { name: 'grass', url: '' } }],
  };
}

type FetchMockOptions = { listOk?: boolean };

function stubFetch(options: FetchMockOptions = {}) {
  const { listOk = true } = options;
  const fetchMock = vi.fn(async (input: string | URL) => {
    const url = String(input);
    if (url.includes('/pokemon?')) {
      return {
        ok: listOk,
        status: listOk ? 200 : 500,
        json: async () => makeListResponse(),
      } as Response;
    }
    const match = url.match(/\/pokemon\/(\d+)\//);
    const id = match ? Number(match[1]) : 1;
    return {
      ok: true,
      status: 200,
      json: async () => makeDetail(id),
    } as Response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function renderPage(page?: string | string[]) {
  const searchParams = Promise.resolve(page === undefined ? {} : { page });
  render(await PokemonListPage({ searchParams }));
}

describe('PokemonListPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('20件のポケモンカードが描画される', async () => {
    stubFetch();
    await renderPage('1');
    expect(screen.getAllByRole('img')).toHaveLength(20);
  });

  test('page 未指定のとき1ページ目（offset=0）として扱われる', async () => {
    const fetchMock = stubFetch();
    await renderPage(undefined);
    const firstUrl = String(fetchMock.mock.calls[0][0]);
    expect(firstUrl).toContain('offset=0');
    expect(screen.getByRole('link', { current: 'page' })).toHaveTextContent(
      '1',
    );
  });

  test('page=abc（非数値）でも notFound せず1ページ目にフォールバックする', async () => {
    stubFetch();
    await renderPage('abc');
    expect(screen.getAllByRole('img')).toHaveLength(20);
    expect(screen.getByRole('link', { current: 'page' })).toHaveTextContent(
      '1',
    );
  });

  test('page=9999（範囲外）でも notFound せず1ページ目にフォールバックする', async () => {
    stubFetch();
    await renderPage('9999');
    expect(screen.getByRole('link', { current: 'page' })).toHaveTextContent(
      '1',
    );
  });

  test('Pagination に正しい totalPages が渡り末尾ページ(52)が描画される', async () => {
    stubFetch();
    await renderPage('1');
    expect(screen.getByRole('link', { name: '52' })).toBeInTheDocument();
  });

  test('一覧API取得失敗時は notFound せず専用エラーUIを表示する', async () => {
    stubFetch({ listOk: false });
    await renderPage('1');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });
});
