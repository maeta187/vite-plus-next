import type { Metadata } from 'next';
import { Pagination } from '@/components/Pagination';
import PokemonCard from '@/components/PokemonCard';
import { fetchPokemonPage } from '@/lib/pokemon/api';

export const metadata: Metadata = {
  title: 'ポケモン一覧',
  description:
    'PokeAPI から取得したポケモンの一覧をページネーション付きで表示します。',
};

// 先頭行（LCP候補）の画像だけ Fetch Priority を上げる件数。
// modern-web-guidance: optimize-image-priority に基づく。
const PRIORITY_IMAGE_COUNT = 5;

type PokemonListPageProps = {
  // Next.js 16 では searchParams は Promise。await してから値を取り出す。
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function PokemonListPage({
  searchParams,
}: PokemonListPageProps) {
  const { page: rawPage } = await searchParams;
  const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage;

  let pokemonPage;
  try {
    pokemonPage = await fetchPokemonPage(pageParam);
  } catch {
    return (
      <main className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
            ポケモン一覧
          </h1>
          <p
            role="alert"
            className="rounded-lg bg-[#f5f5f7] p-6 text-center text-sm text-foreground/60 dark:bg-[#272729]"
          >
            ポケモン一覧を取得できませんでした。時間をおいて再度お試しください。
          </p>
        </div>
      </main>
    );
  }

  const { items, totalPages, currentPage } = pokemonPage;

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-foreground">
          ポケモン一覧
        </h1>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((pokemon, index) => (
            <li key={pokemon.id}>
              <PokemonCard
                {...pokemon}
                priority={index < PRIORITY_IMAGE_COUNT}
              />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </main>
  );
}
