/**
 * PokeAPI (https://pokeapi.co) のレスポンス型と、UI 表示用に整形した型の定義。
 *
 * `page.tsx` の `searchParams` は Next.js 16 の実 API に合わせ
 * `Promise<{ page?: string | string[] }>` として受け取り、
 * `const { page: rawPage } = await searchParams;` のように `await` してから
 * 値を取り出す（同期アクセスは廃止済み。実装は Step8 の page.tsx 側）。
 */

/** 一覧API `results[]` の 1 要素。 */
export type PokemonListItem = {
  name: string;
  url: string;
};

/** 一覧API `GET /api/v2/pokemon?limit=20&offset={offset}` のレスポンス。 */
export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
};

/** 詳細API `GET /api/v2/pokemon/{id or name}` のレスポンス（利用部分のみ）。 */
export type PokemonDetail = {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  types: {
    slot: number;
    type: { name: string; url: string };
  }[];
};

/**
 * UI 表示用に整形したポケモン 1 件分のデータ。
 * `imageUrl` は official-artwork が存在しないポケモンで `null` になり得る。
 * `null` の場合のプレースホルダー差し替えは PokemonCard 側の責務。
 */
export type PokemonSummary = {
  id: number;
  name: string;
  imageUrl: string | null;
  types: string[];
};

/** 1 ページ分の統合結果（一覧＋詳細＋ページ数）。 */
export type PokemonPage = {
  items: PokemonSummary[];
  totalPages: number;
  currentPage: number;
};
