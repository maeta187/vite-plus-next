import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vite-plus/test';

afterEach(() => {
  cleanup();
});
import PokemonTypeBadge from './PokemonTypeBadge';

describe('PokemonTypeBadge', () => {
  test('type=fire でタイプ名が表示され fire の配色が適用される', () => {
    render(<PokemonTypeBadge type="fire" />);
    const badge = screen.getByText('fire');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ backgroundColor: '#f08030' });
  });

  test('未知のタイプではフォールバック配色になる', () => {
    render(<PokemonTypeBadge type="unknown-type" />);
    const badge = screen.getByText('unknown-type');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ backgroundColor: '#a8a878' });
  });
});
