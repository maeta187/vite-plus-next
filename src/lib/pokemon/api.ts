/**
 * PokeAPI (https://pokeapi.co) から一覧・詳細を取得し、
 * UI 表示用のページデータへ整形するユーティリティ。
 */
import type {
  PokemonDetail,
  PokemonListItem,
  PokemonListResponse,
  PokemonPage,
  PokemonSummary,
} from './types';

/** 一覧APIの1ページあたりの件数。 */
export const PAGE_SIZE = 20;

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

/** 指定ページの一覧を取得する。 */
export async function fetchPokemonList(
  page: number,
): Promise<PokemonListResponse> {
  const offset = (page - 1) * PAGE_SIZE;
  const res = await fetch(
    `${POKEAPI_BASE_URL}?limit=${PAGE_SIZE}&offset=${offset}`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    throw new Error(`ポケモン一覧の取得に失敗しました: status=${res.status}`);
  }

  return res.json() as Promise<PokemonListResponse>;
}

/** 詳細APIのレスポンスを UI 表示用の形に整形する。 */
export function toPokemonSummary(detail: PokemonDetail): PokemonSummary {
  return {
    id: detail.id,
    name: detail.name,
    imageUrl: detail.sprites.other['official-artwork'].front_default,
    types: detail.types.map((t) => t.type.name),
  };
}

/** 一覧の各要素の詳細を並列取得し、成功分のみ整形して返す。 */
export async function fetchPokemonDetails(
  results: PokemonListItem[],
): Promise<PokemonSummary[]> {
  const settled = await Promise.allSettled(
    results.map(async (item) => {
      const res = await fetch(item.url, { next: { revalidate: 3600 } });
      if (!res.ok) {
        throw new Error(`ポケモン詳細の取得に失敗しました: ${item.url}`);
      }
      const detail = (await res.json()) as PokemonDetail;
      return toPokemonSummary(detail);
    }),
  );

  return settled
    .filter(
      (r): r is PromiseFulfilledResult<PokemonSummary> =>
        r.status === 'fulfilled',
    )
    .map((r) => r.value);
}

/** クエリパラメータの生ページ番号を、有効な正の整数へ正規化する。 */
export function normalizePage(
  rawPage: string | undefined,
  totalPages?: number,
): number {
  const parsed = Number(rawPage);

  if (rawPage === undefined || !Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  if (totalPages !== undefined && parsed > totalPages) {
    return 1;
  }

  return parsed;
}

/**
 * 一覧の総件数からページ範囲を確定し、詳細を取得して
 * 1ページ分のデータを組み立てる。
 */
export async function fetchPokemonPage(
  rawPage: string | undefined,
): Promise<PokemonPage> {
  const provisionalPage = normalizePage(rawPage, undefined);
  const provisionalList = await fetchPokemonList(provisionalPage);
  const totalPages = Math.ceil(provisionalList.count / PAGE_SIZE);

  const currentPage = normalizePage(rawPage, totalPages);

  const list =
    provisionalPage === currentPage
      ? provisionalList
      : await fetchPokemonList(1);

  const items = await fetchPokemonDetails(list.results);

  return { items, totalPages, currentPage };
}
