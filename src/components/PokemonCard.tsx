import Image from 'next/image';
import type { PokemonSummary } from '@/lib/pokemon/types';
import PokemonTypeBadge from './PokemonTypeBadge';

const PLACEHOLDER_IMAGE = '/pokemon-placeholder.png';

type PokemonCardProps = PokemonSummary & {
  priority?: boolean;
};

export default function PokemonCard({
  id,
  name,
  imageUrl,
  types,
  priority,
}: PokemonCardProps) {
  const src = imageUrl ?? PLACEHOLDER_IMAGE;

  return (
    <div className="rounded-lg bg-[#f5f5f7] p-4 shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0px] dark:bg-[#272729]">
      <Image
        src={src}
        alt={name}
        width={200}
        height={200}
        priority={priority}
      />
      <p>{`No. ${String(id).padStart(4, '0')}`}</p>
      <p>{name}</p>
      <div className="flex gap-1">
        {types.map((type) => (
          <PokemonTypeBadge key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
