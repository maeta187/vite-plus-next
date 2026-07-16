import Link from 'next/link';

export type PaginationItem = number | '...';

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const visible = new Set<number>(
    [1, totalPages, currentPage - 1, currentPage, currentPage + 1].filter(
      (page) => page >= 1 && page <= totalPages,
    ),
  );
  const sorted = Array.from(visible).sort((a, b) => a - b);

  const result: PaginationItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    result.push(page);

    if (i < sorted.length - 1) {
      const next = sorted[i + 1];
      const gap = next - page - 1;
      if (gap === 1) {
        result.push(page + 1);
      } else if (gap >= 2) {
        result.push('...');
      }
    }
  }

  return result;
}

type Props = {
  currentPage: number;
  totalPages: number;
};

export function Pagination({ currentPage, totalPages }: Props) {
  const range = getPaginationRange(currentPage, totalPages);

  return (
    <nav aria-label="ページネーション">
      <ul className="flex items-center gap-1">
        {range.map((item, index) =>
          item === '...' ? (
            <li key={`ellipsis-${index}`}>
              <span aria-hidden="true" className="px-2 text-foreground/60">
                ...
              </span>
            </li>
          ) : (
            <li key={item}>
              <Link
                href={`?page=${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
                className={
                  item === currentPage
                    ? 'flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#0071e3] px-2 font-medium text-white'
                    : 'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-foreground hover:bg-[#0071e3]/10'
                }
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
