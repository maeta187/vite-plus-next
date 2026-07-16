import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vite-plus/test';

afterEach(() => {
  cleanup();
});
import PokemonCard from './PokemonCard';

describe('PokemonCard', () => {
  test('名前・図鑑番号・画像・タイプバッジが表示される', () => {
    render(
      <PokemonCard
        id={1}
        name="bulbasaur"
        imageUrl="https://example.com/bulbasaur.png"
        types={['grass']}
      />,
    );

    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('No. 0001')).toBeInTheDocument();
    expect(screen.getByAltText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('grass')).toBeInTheDocument();
  });

  test('types が複数ある場合、バッジが複数描画される', () => {
    render(
      <PokemonCard
        id={2}
        name="ivysaur"
        imageUrl="https://example.com/ivysaur.png"
        types={['grass', 'poison']}
      />,
    );

    expect(screen.getByText('grass')).toBeInTheDocument();
    expect(screen.getByText('poison')).toBeInTheDocument();
  });

  test('imageUrl が null の場合プレースホルダー画像が使われる', () => {
    render(<PokemonCard id={3} name="missingno" imageUrl={null} types={[]} />);

    const img = screen.getByAltText('missingno');
    expect(img.getAttribute('src')).toContain('pokemon-placeholder');
  });
});
