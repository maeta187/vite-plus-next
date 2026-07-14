# ポケモン一覧機能 仕様

## 目的

PokeAPI (https://pokeapi.co) を利用し、ポケモンの一覧をページネーション付きで表示する画面を `src/app/pokemon-list/` に実装する。React/Next.js の学習用トピックとして、Server Component での外部API fetch・N+1フェッチの並列化・Next.js の fetch キャッシュ活用パターンを実践する。

## 対象ユーザー・ユースケース

- `/pokemon-list` にアクセスすると、1ページ20件のポケモン一覧が表示される。
- `/pokemon-list?page=2` のようにクエリパラメータでページを指定できる。
- ページ下部のページ番号リンク（例: `1 2 3 ... 52`）をクリックして別のページへ遷移できる。

## 表示項目（確定）

各ポケモンカードに以下を表示する。

- 名前（PokeAPI の `name`。英語表記のまま、もしくは先頭大文字化などの軽微な整形は実装時に任意）
- 図鑑番号（詳細APIの `id`。例: `No. 0001` 形式など）
- 画像（詳細APIの `sprites.other['official-artwork'].front_default`。`next/image` の `<Image>` コンポーネントで表示する（確定）。画像ホスト `raw.githubusercontent.com` を `next.config.mjs` の `images.remotePatterns` に許可する）
  - **（確定）画像URLが `null` の場合のフォールバック**: PokeAPI の `sprites.other['official-artwork'].front_default` は `null` を返すポケモンが存在し得る。`next/image` の `<Image src={null}>` はエラーになるため、`imageUrl` が `null`/未取得の場合はプレースホルダー画像（例: `public/` 配下に配置する汎用のモノクロ・シルエット画像、またはポケボール等のダミー画像）を代わりに表示する。プレースホルダー画像自体は `next/image` の `remotePatterns` 許可対象外のローカルアセットとする。
- タイプバッジ（詳細APIの `types[].type.name`。1〜2個、複数タイプは複数バッジで表示）

## データソース（確定・調査結果）

- 一覧: `GET https://pokeapi.co/api/v2/pokemon?limit=20&offset={offset}`
  - レスポンス: `{ count, next, previous, results: [{ name, url }] }`
  - `count` を使って総ページ数を計算する（`Math.ceil(count / 20)`）。
  - `results[].url` はそのポケモンの詳細APIのURL（`https://pokeapi.co/api/v2/pokemon/{id}/`）。
- 詳細: `GET https://pokeapi.co/api/v2/pokemon/{id or name}`
  - `id`: 図鑑番号
  - `sprites.other['official-artwork'].front_default`: 画像URL
  - `types: [{ slot, type: { name, url } }]`: タイプ配列。`type.name` を表示に使う。
- 一覧APIにはタイプ・画像情報が含まれないため、一覧取得後に各ポケモンの詳細APIを **N+1フェッチ**する（`Promise.allSettled` で並列化。個別失敗時にページ全体を落とさないため）。1ページ20件なので同時リクエスト数は最大20。
- 詳細フェッチが個別に失敗した場合（確定）: **失敗したポケモンのカードのみをスキップ、またはタイプ情報なしのフォールバック表示にする**。ページ全体を落とさない。一覧APIそのものの失敗時は専用エラーUIを表示する。

## ページネーション仕様（確定）

- 方式: ページ番号一覧（「1 2 3 ... 52」のようなリンク）。前後ボタンのみの方式は採用しない。
- 1ページ20件固定。
- ページ番号は `<Link href="?page=n">` によるサーバーサイド遷移（クライアント側の state は持たない）。
- 不正な `page` クエリ（範囲外・非数値・負数を含む）が来た場合は **1ページ目にフォールバックする**（確定）。`notFound()` は使わない。データ取得自体に失敗した場合（PokeAPI障害等）は専用のエラーUIを表示する（`notFound()` は使わない）。
- ページ番号一覧の省略記号（`...`）ルール（確定）: 総ページ数が7以下の場合は常に全ページ番号をそのまま表示する（省略しない）。総ページ数が8以上の場合は、先頭ページ・末尾ページ・現在ページの前後1ページ（±1）を常に表示し、それ以外の隠れる区間は、区間の長さが2ページ以上なら `...` にまとめて置き換え、区間の長さがちょうど1ページなら省略記号を使わずそのページ番号をそのまま表示する（詳細な仕様・境界値は `plan.md` Step7 の `getPaginationRange` 定義を参照）。

## タイプバッジの配色（確定・DESIGN.mdの例外）

- DESIGN.md の Apple 風デザインは「アクセントカラーは Apple Blue のみ」という原則だが、ポケモンタイプバッジについては **例外として、タイプごとの慣用色（ほのお=赤系、みず=青系、くさ=緑系 等）を用いてよい**ことを確定事項とする。
- DESIGN.md には「ポケモンタイプバッジはこのデザインシステムの例外であり、タイプ別配色を用いる」という趣旨の追記を行う（plan.md Step 参照）。
- カード自体のレイアウト・タイポグラフィ・角丸・シャドウ等、バッジの背景色以外は DESIGN.md の規約に従う。

## 多言語対応（確定・対象外）

- 日本語化などの多言語対応は行わない。PokeAPIが返す英語表記のまま、ポケモン名・タイプ名を表示する。翻訳レイヤーは設けない。

## テスト戦略（確定）

- `fetch` を `vi.stubGlobal('fetch', vi.fn())` で直接モックする。MSW 等の追加ライブラリは導入しない。
- テストは `vite-plus/test` からインポートする vitest（`describe/test/expect/vi` 等）と `@testing-library/react` を使用する。

## 受け入れ基準

- `/pokemon-list` にアクセスすると20件のポケモンカード（名前・図鑑番号・画像・タイプバッジ）が表示される。
- ページ番号リンクをクリックすると、該当ページのポケモンに切り替わる。
- 不正な `page` クエリ（範囲外・非数値・負数）を指定しても `notFound()` にならず、1ページ目の内容が表示される。
- ページ番号一覧は、総ページ数が7以下の場合は全ページ番号がそのまま表示され、総ページ数が8以上の場合は先頭・末尾・現在ページ前後1ページを表示し、隠れる区間が2ページ以上のときのみ `...` で省略表示される（隠れる区間が1ページだけのときは省略せず数字を表示する）。
- 一部の詳細フェッチが失敗しても、ページ全体はエラーにならず、成功した分のカード（または該当ポケモンをタイプなしでフォールバック表示したカード）が表示される。
- 画像は `next/image` の `<Image>` で表示され、`next.config.mjs` の `images.remotePatterns` にPokeAPIの画像ホストが許可されている。
- 詳細APIの `sprites.other['official-artwork'].front_default` が `null` のポケモンでもエラーにならず、プレースホルダー画像で代替表示される。
- 一覧APIが1回、詳細APIが最大20回（表示件数分）、`Promise.allSettled` で並列に呼ばれる。
- 詳細APIの結果はNext.jsのfetchキャッシュ機構を通じて再利用され得る（同一offset/ページへの再アクセス時に毎回全件fetchし直さない設計であることがコードから読み取れる）。
- `vp check` と `vp test` が通ること。
