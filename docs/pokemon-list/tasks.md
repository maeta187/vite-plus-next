# ポケモン一覧機能 タスク

ステータス: 計画確定・実装未着手

対応する文書: `docs/pokemon-list/spec.md`（仕様） / `docs/pokemon-list/plan.md`（実装計画）

## Step 0. 準備

- [ ] `vp install --frozen-lockfile` でリモートの変更を取り込む

## Step 1. 型定義

- [ ] `src/lib/pokemon/types.ts` にレスポンス型（`PokemonListResponse`, `PokemonDetail`, `PokemonSummary` 等。`PokemonSummary.imageUrl` は `string | null` とする）を定義する
- [ ] `src/app/pokemon-list/page.tsx` 用の Props 型として `searchParams: Promise<{ page?: string | string[] }>` を前提とする方針をコメント等で明記する（Next.js 16 の実APIに合わせ `await searchParams` が必須、Step8で実装）

## Step 2. `fetchPokemonList`（TDD）

- [ ] テスト項目をレビュー・承認を得る（plan.md Step2 参照）
- [ ] `src/lib/pokemon/api.test.ts` にテストを書き、Red を確認する
- [ ] `src/lib/pokemon/api.ts` に `fetchPokemonList(page)` を実装し、Green にする
- [ ] `PAGE_SIZE` 定数の切り出しなどリファクタリングを行い、Green を維持する

## Step 3. `fetchPokemonDetails`（N+1並列フェッチ、TDD）

- [ ] テスト項目をレビュー・承認を得る（plan.md Step3 参照。個別失敗時は該当ポケモンをスキップ/フォールバックする方針で確定済み。画像URLが `null` の場合は `imageUrl: null` をそのまま返す方針も含む）
- [ ] テストを書き、Red を確認する（個別失敗ケース・全件失敗ケース・画像URLが `null` のケースを含む）
- [ ] `fetchPokemonDetails(results)` を実装し、Green にする（`Promise.allSettled` で並列化し、失敗要素をスキップ/フォールバック。`imageUrl` が `null` の場合はそのまま `null` を保持する）
- [ ] レスポンス整形処理（`toPokemonSummary`）を分離するリファクタリングを行う

## Step 4. `fetchPokemonPage`（統合ヘルパー、TDD）

- [ ] テスト項目をレビュー・承認を得る（plan.md Step4 参照。`normalizePage`↔`totalPages` の2段階フェッチフローが確定済み）
- [ ] テストを書き、Red を確認する（`normalizePage` の不正値フォールバックケースに加え、`page=9999`（範囲外・再フェッチ発生）と `page=abc`（非数値・再フェッチ不要）の `fetch` 呼び出し回数差を検証するケースを含む）
- [ ] `fetchPokemonPage(page)` を実装し、Green にする（暫定ページでの1回目フェッチ→`count`確定→範囲外なら1ページ目相当で再フェッチ、という2段階フローで `totalPages` 計算・`normalizePage` による不正page値の1ページ目フォールバックを行う）
- [ ] リファクタリングを行い、Green を維持する

## Step 5. `PokemonTypeBadge`（TDD）

- [ ] テスト項目をレビュー・承認を得る（plan.md Step5 参照）
- [ ] `src/components/PokemonTypeBadge.test.tsx` にテストを書き、Red を確認する
- [ ] `src/components/PokemonTypeBadge.tsx` を実装し、Green にする（タイプ別配色マッピング）
- [ ] リファクタリングを行う

## Step 6. `PokemonCard`（TDD）

- [ ] テスト項目をレビュー・承認を得る（plan.md Step6 参照。`imageUrl` が `null` の場合のプレースホルダー画像フォールバックを含む）
- [ ] `src/components/PokemonCard.test.tsx` にテストを書き、Red を確認する（`imageUrl={null}` のケースを含む）
- [ ] プレースホルダー画像アセット（`public/pokemon-placeholder.png` 等）を追加する
- [ ] `src/components/PokemonCard.tsx` を実装し、Green にする（`imageUrl` が `null` の場合はプレースホルダー画像にフォールバックする）
- [ ] リファクタリングを行う

## Step 7. `Pagination`（TDD）

- [ ] テスト項目をレビュー・承認を得る（plan.md Step7 参照。省略記号ルールは「`totalPages<=7`は常に全件表示、`totalPages>7`は先頭・末尾・現在ページ前後1ページ表示＋隠れる区間が2ページ以上なら`...`・1ページのみなら数字表示」で確定済み）
- [ ] `src/components/Pagination.test.tsx` にテストを書き、Red を確認する（`totalPages<=7`の全件表示ケース、先頭付近・末尾付近・中間の truncate ケース、隠れる区間が1ページだけの境界値ケースを含む）
- [ ] 省略ロジックを `getPaginationRange(currentPage, totalPages)` 等の関数として切り出し、単体テストを書く（plan.md Step7 記載の境界値ケースを網羅）
- [ ] `src/components/Pagination.tsx` を実装し、Green にする
- [ ] リファクタリングを行う

## Step 8. `src/app/pokemon-list/page.tsx`（統合、TDD）

- [ ] テスト項目をレビュー・承認を得る（plan.md Step8 参照。不正pageクエリは1ページ目フォールバック、`notFound()`不使用で確定済み。`searchParams` は `Promise<{ page?: string | string[] }>` として受け取り `await` する点も確定済み）
- [ ] `src/app/pokemon-list/page.test.tsx` にテストを書き、Red を確認する（`searchParams` を `Promise` として渡すテストダブル・不正page値のフォールバック・詳細fetch個別失敗時のフォールバック・一覧fetch失敗時のエラーUIを含む。Server Componentのテスト手法を確認・調整する）
- [ ] `src/app/pokemon-list/page.tsx` を実装し、Green にする（`const { page: rawPage } = await searchParams;` で値を取り出し、一覧fetch失敗時の専用エラーUIを含む）
- [ ] リファクタリングを行う

## Step 9. 設定・デザイン文書の更新

- [ ] `next.config.mjs` に `images.remotePatterns`（`raw.githubusercontent.com`）を追加する（`next/image` 採用のため必須、確定済み）
- [ ] `DESIGN.md` に「ポケモンタイプバッジは例外としてタイプ別配色を用いる」旨を追記する

## Step 10. 仕上げ

- [ ] `vp check` を実行し、フォーマット・lint・型チェックが全て通過することを確認する
- [ ] `vp test` を実行し、全テストが Green であることを確認する
- [ ] `vp run dev` で `/pokemon-list` を目視確認する（任意）

## 未解決の論点

なし。以下7点はユーザー判断・計画レビューにより決定済み（2026-07-13、詳細は plan.md 参照）。

- [x] 論点1: 不正な `page` クエリの扱い → 1ページ目にフォールバック（`notFound()` は使わない）
- [x] 論点2: 詳細fetch失敗時の挙動 → 該当ポケモンをスキップ/タイプ無しでフォールバック表示
- [x] 論点3: ページ番号一覧の省略記号（`...`）のルール → `totalPages<=7`は常に全件表示、`totalPages>7`は先頭・末尾・現在ページ前後1ページを表示し、隠れる区間が2ページ以上なら`...`、1ページのみなら数字をそのまま表示
- [x] 論点4: 画像表示 → `next/image` を採用し、`next.config.mjs` に `remotePatterns` を追加。画像URLが `null` の場合はローカルのプレースホルダー画像にフォールバック
- [x] 論点5: ポケモン名・タイプ名の多言語化 → 行わない（英語表記のまま表示）
- [x] 論点6: `searchParams` の型 → `Promise<{ page?: string | string[] }>` として受け取り `await searchParams` してから値を取り出す（Next.js 16 の実APIに準拠）
- [x] 論点7: `normalizePage` と `totalPages` の連携フロー → 暫定ページで1回目フェッチし `count`/`totalPages` を確定、範囲外だった場合のみ1ページ目相当で再フェッチする2段階フロー
