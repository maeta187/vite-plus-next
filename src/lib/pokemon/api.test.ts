import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vite-plus/test';
import {
  PAGE_SIZE,
  fetchPokemonDetails,
  fetchPokemonList,
  fetchPokemonPage,
  normalizePage,
  toPokemonSummary,
} from './api';
import type { PokemonDetail, PokemonListItem } from './types';

const makeListResponse = (count: number, results: PokemonListItem[]) => ({
  count,
  next: null,
  previous: null,
  results,
});

const makeListItems = (n: number): PokemonListItem[] =>
  Array.from({ length: n }, (_, i) => ({
    name: `pokemon-${i + 1}`,
    url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
  }));

const makeDetail = (overrides: Partial<PokemonDetail> = {}): PokemonDetail => ({
  id: 1,
  name: 'bulbasaur',
  sprites: {
    other: {
      'official-artwork': {
        front_default: 'https://example.com/1.png',
      },
    },
  },
  types: [{ slot: 1, type: { name: 'grass', url: 'https://example.com' } }],
  ...overrides,
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchPokemonList', () => {
  test('page=1のとき offset=0 の正しいURLでfetchする', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeListResponse(0, []),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchPokemonList(1);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0',
      expect.anything(),
    );
  });

  test('page=2のとき offset=20 の正しいURLでfetchする', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeListResponse(0, []),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchPokemonList(2);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://pokeapi.co/api/v2/pokemon?limit=20&offset=20',
      expect.anything(),
    );
  });

  test('fetchに next.revalidate が渡る', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeListResponse(0, []),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchPokemonList(1);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ next: { revalidate: 3600 } }),
    );
  });

  test('res.ok が false のとき throw する', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchPokemonList(1)).rejects.toThrow();
  });
});

describe('toPokemonSummary', () => {
  test('id, name, imageUrl, types を抽出する', () => {
    const detail = makeDetail();

    const summary = toPokemonSummary(detail);

    expect(summary).toEqual({
      id: 1,
      name: 'bulbasaur',
      imageUrl: 'https://example.com/1.png',
      types: ['grass'],
    });
  });

  test('front_default が null の場合 imageUrl は null のまま保持する', () => {
    const detail = makeDetail({
      sprites: {
        other: {
          'official-artwork': {
            front_default: null,
          },
        },
      },
    });

    const summary = toPokemonSummary(detail);

    expect(summary.imageUrl).toBeNull();
  });
});

describe('fetchPokemonDetails', () => {
  test('20件の場合 fetch を20回呼ぶ', async () => {
    const items = makeListItems(PAGE_SIZE);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeDetail(),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchPokemonDetails(items);

    expect(fetchMock).toHaveBeenCalledTimes(PAGE_SIZE);
  });

  test('各fetchに next.revalidate が渡る', async () => {
    const items = makeListItems(1);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeDetail(),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchPokemonDetails(items);

    expect(fetchMock).toHaveBeenCalledWith(
      items[0].url,
      expect.objectContaining({ next: { revalidate: 3600 } }),
    );
  });

  test('2件目のfetchだけ失敗した場合、残りの件数を返す', async () => {
    const items = makeListItems(3);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeDetail({ id: 1 }),
      })
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeDetail({ id: 3 }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchPokemonDetails(items);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual([1, 3]);
  });

  test('全件失敗した場合 空配列を返す', async () => {
    const items = makeListItems(2);
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchPokemonDetails(items);

    expect(result).toEqual([]);
  });
});

describe('normalizePage', () => {
  test('正の整数の文字列はその数値になる', () => {
    expect(normalizePage('3')).toBe(3);
  });

  test('undefinedは1になる', () => {
    expect(normalizePage(undefined)).toBe(1);
  });

  test('数値でない文字列は1になる', () => {
    expect(normalizePage('abc')).toBe(1);
  });

  test('負の数は1になる', () => {
    expect(normalizePage('-1')).toBe(1);
  });

  test('0は1になる', () => {
    expect(normalizePage('0')).toBe(1);
  });

  test('小数は1になる', () => {
    expect(normalizePage('1.5')).toBe(1);
  });

  test('totalPages指定でpageが範囲外の場合は1になる', () => {
    expect(normalizePage('5', 3)).toBe(1);
  });

  test('totalPages指定でpageが範囲内の場合はその数値になる', () => {
    expect(normalizePage('2', 3)).toBe(2);
  });
});

describe('fetchPokemonPage', () => {
  test('一覧取得後に詳細を取得し、正しい形で結果を返す', async () => {
    const items = makeListItems(PAGE_SIZE);
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/pokemon?')) {
        return Promise.resolve({
          ok: true,
          json: async () => makeListResponse(40, items),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => makeDetail(),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchPokemonPage('1');

    expect(result.items).toHaveLength(PAGE_SIZE);
    expect(result.totalPages).toBe(2);
    expect(result.currentPage).toBe(1);
  });

  test('totalPagesはcount/PAGE_SIZEの切り上げになる', async () => {
    const items = makeListItems(PAGE_SIZE);
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/pokemon?')) {
        return Promise.resolve({
          ok: true,
          json: async () => makeListResponse(41, items),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => makeDetail(),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchPokemonPage('1');

    expect(result.totalPages).toBe(3);
  });

  test('page=9999のように範囲外の場合、currentPage=1になり一覧fetchは2回呼ばれる', async () => {
    const items = makeListItems(PAGE_SIZE);
    let listFetchCount = 0;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/pokemon?')) {
        listFetchCount += 1;
        return Promise.resolve({
          ok: true,
          json: async () => makeListResponse(40, items),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => makeDetail(),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchPokemonPage('9999');

    expect(result.currentPage).toBe(1);
    expect(listFetchCount).toBe(2);
  });

  test('page="abc"のように無効な場合、currentPage=1になり一覧fetchは1回だけ呼ばれる', async () => {
    const items = makeListItems(PAGE_SIZE);
    let listFetchCount = 0;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/pokemon?')) {
        listFetchCount += 1;
        return Promise.resolve({
          ok: true,
          json: async () => makeListResponse(40, items),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => makeDetail(),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchPokemonPage('abc');

    expect(result.currentPage).toBe(1);
    expect(listFetchCount).toBe(1);
  });
});
