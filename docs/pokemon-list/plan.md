# ポケモン一覧機能 実装計画

対応する仕様: `docs/pokemon-list/spec.md`
タスク一覧: `docs/pokemon-list/tasks.md`

## 目的

PokeAPI から取得したポケモン一覧を、名前・図鑑番号・画像・タイプバッジ付きでページネーション表示する画面を `src/app/pokemon-list/` に追加する。既存の `src/app/register/` の構成パターンと TDD ワークフロー（CLAUDE.md）を踏襲しつつ、Server Component からの外部API fetch・N+1フェッチの並列化・Next.js fetch キャッシュの活用を実践する。

## 前提・調査結果

### 既存コードの構成パターン（`src/app/register/`）

- `src/app/register/page.tsx`: Server Component。`metadata` を export し、レイアウト（見出し・カード枠）を描画して `RegisterPageClient` を配置するだけ。ロジックは持たない。
- `src/app/register/RegisterPageClient.tsx`: `'use client'`。`useState` で画面状態（フォーム/完了パネル）を切り替える。
- `src/components/RegisterForm.tsx`: UIパーツ本体（フォーム）。`react-hook-form` + `zodResolver` を使用。
- `src/lib/schemas/register.ts`: zod スキーマ・型定義（ロジック層）。
- テストは対象コンポーネントと同じディレクトリに `*.test.tsx` として配置（例: `src/app/register/RegisterPage.test.tsx`、`src/components/RegisterForm.test.tsx`）。ロジック層のテストは `src/lib/schemas/register.test.ts`。
- テストの共通パターン: `import { describe, expect, test, afterEach } from 'vite-plus/test'`、`@testing-library/react` の `render/screen/waitFor/cleanup`、`afterEach(() => cleanup())`。

今回は一覧本体を Server Component で直接 fetch する方針のため、`RegisterPageClient` に相当するクライアントラッパーは必須ではない。対話的な要素（ページ番号リンクなど）は `<Link>` で完結しページ遷移をサーバー側に任せるため、クライアントコンポーネントは「必要になった場合のみ」導入する（例: 将来的にローディングスピナーやクライアント側フィルタを足す場合）。現時点の要件ではクライアントコンポーネント不要。

### PokeAPI レスポンス構造（調査結果、WebFetch: https://pokeapi.co/docs/v2）

- 一覧: `GET /api/v2/pokemon?limit=20&offset={offset}`
  ```json
  {
    "count": 1025,
    "next": "https://pokeapi.co/api/v2/pokemon?limit=20&offset=20",
    "previous": null,
    "results": [
      { "name": "bulbasaur", "url": "https://pokeapi.co/api/v2/pokemon/1/" }
    ]
  }
  ```
  - `count` から総ページ数を算出: `Math.ceil(count / PAGE_SIZE)`。
  - `results[].url` を各詳細フェッチの取得先として利用（`name` からではなく `url` をそのまま fetch する方が安全）。
- 詳細: `GET /api/v2/pokemon/{id or name}`
  - `id`: 図鑑番号
  - `sprites.other['official-artwork'].front_default`: 画像URL（`https://raw.githubusercontent.com/...` ドメイン）
  - `types: [{ slot: number, type: { name: string, url: string } }]`: タイプ配列。表示には `types[].type.name` を使う。

### Next.js の fetch キャッシュ挙動（調査結果）

- 本プロジェクトの `next` は `16.1.6`（package.json）。Next.js 16 系では **fetch のデフォルトが `no-store` 相当（動的・キャッシュなし）** に変更されており、Next.js 13/14 系のような暗黙の `force-cache` は行われない。
- キャッシュを効かせるには明示的なオプション指定が必要:
  - `fetch(url, { next: { revalidate: <秒> } })` … 指定秒数キャッシュ（ISR的挙動）。
  - `fetch(url, { cache: 'force-cache' })` … 明示的にキャッシュ。
- 本機能ではポケモンの詳細データはほぼ不変のため、`next: { revalidate: 3600 }`（1時間）程度を詳細・一覧フェッチ双方に指定し、「fetch キャッシュを活用する」という確定要件を満たす。同一offsetへの再アクセス（同一ページへの戻り操作等）でキャッシュが再利用されることを意図する。
- 参考: [Next.js fetch API reference](https://nextjs.org/docs/app/api-reference/functions/fetch)

### next/image と外部画像ドメイン

- `next.config.mjs` には現状 `images.remotePatterns` の設定がない。PokeAPI の official-artwork 画像は `raw.githubusercontent.com` ドメインでホストされているため、`next/image` の `<Image>` を使う場合は `next.config.mjs` に `images.remotePatterns` の追加が必要（実装ステップに含める）。

### DESIGN.md

- Apple 風デザインで「アクセントカラーは Apple Blue のみ」が原則（DESIGN.md セクション7 Don't: 「Don't introduce additional accent colors」）。今回はユーザー承認済みの例外として、タイプバッジのみタイプ別配色を許可する旨を DESIGN.md に追記する。
- カードのレイアウトは DESIGN.md の「Cards & Containers」（背景 `#f5f5f7`、角丸 8px、ボーダーなし、シャドウなし or `rgba(0,0,0,0.22) 3px 5px 30px 0px`）に準拠させる。

### テスト基盤（`vite.config.ts` 確認済み）

- `test.environment: 'jsdom'`、`setupFiles: ['./src/test/setup.ts']`（jest-dom matchers 拡張）、`alias '@' -> src`。
- `vite-plus/test` から `describe/test/expect/vi/afterEach/beforeEach` 等をインポートする。

## 影響範囲

新規追加ファイル（想定）:

- `src/lib/pokemon/api.ts` — PokeAPI 呼び出しロジック（一覧取得・詳細取得・N+1並列フェッチ・ページ数計算）
- `src/lib/pokemon/api.test.ts` — 上記のユニットテスト（`fetch` を `vi.stubGlobal` でモック）
- `src/lib/pokemon/types.ts`（または `api.ts` 内に同居） — レスポンス型定義
- `src/components/PokemonCard.tsx` — 1件分のカードUI（画像・名前・図鑑番号・タイプバッジ。`imageUrl` が `null` の場合のプレースホルダー画像フォールバックを含む）
- `src/components/PokemonCard.test.tsx`
- `public/pokemon-placeholder.png`（または同等のローカル画像） — `imageUrl` が `null` の場合に表示するプレースホルダー画像アセット
- `src/components/PokemonTypeBadge.tsx` — タイプバッジUI（タイプ名→配色マッピングを内包）
- `src/components/PokemonTypeBadge.test.tsx`
- `src/components/Pagination.tsx` — ページ番号一覧UI（`<Link href="?page=n">` 生成）
- `src/components/Pagination.test.tsx`
- `src/app/pokemon-list/page.tsx` — Server Component。`searchParams` からページ番号を受け取り、一覧+詳細をfetchしてカード一覧とページネーションを描画
- `src/app/pokemon-list/page.test.tsx`（または `PokemonListPage.test.tsx`） — `fetch` モックを使ったページ全体の統合テスト

既存ファイルへの変更:

- `next.config.mjs` — `images.remotePatterns` に PokeAPI の画像ドメイン（`raw.githubusercontent.com`）を追加（確定: `next/image` を採用するため必須）
- `DESIGN.md` — 「ポケモンタイプバッジは例外としてタイプ別配色を用いる」旨を Do's and Don'ts またはセクション末尾に追記

壊れる可能性のあるもの:

- 既存の `src/app/register/`、`src/app/react-bits/`、トップページには影響しない（新規ルート追加のみ）。
- `next.config.mjs` の変更は他ルートの `next/image` 挙動には影響しない（`remotePatterns` の追加のみで既存許可は維持）。

## 実装ステップ

各ステップは CLAUDE.md の TDD 方針（テスト項目提示→Red→Green→Refactor）に従う。Step 1〜3 は型定義・PokeAPI呼び出しロジック層、Step 4 は一覧+詳細+ページ数を束ねる統合ヘルパー層、Step 5〜7 はUIコンポーネント層、Step 8 はページ（`page.tsx`）統合、Step 9 は設定・デザイン文書の更新、Step 10 は仕上げ。

### Step 0. 準備

- `vp install --frozen-lockfile` でリモートの変更を取り込む（作業開始チェックリスト）。
- 実装は `feature/pokemon-list` ブランチ上で継続する。

### Step 1. PokeAPI 型定義とAPIヘルパーの骨格

- **目的**: `src/lib/pokemon/types.ts`（または `api.ts` 内）に一覧/詳細レスポンスの型（`PokemonListResponse`, `PokemonDetail` など）を定義する。ロジックがないため純粋なテスト対象は次Stepから。
- 型のみのためテストは不要（TypeScriptの型チェックは `vp check` で担保）。
- **（確定・重要）`page.tsx` の `searchParams` 型**: Next.js 15/16 では Server Component の `searchParams` プロパティは同期オブジェクトではなく `Promise<{ [key: string]: string | string[] | undefined }>` として渡され、コンポーネント内で `await searchParams` して初めて値を取得できる（同期アクセスは廃止済み）。本機能で使う型としては `type PokemonListPageProps = { searchParams: Promise<{ page?: string | string[] }> }` を `src/app/pokemon-list/page.tsx` 側で定義し、`normalizePage` に渡す前に `const { page: rawPage } = await searchParams;` のように `await` を挟むことをこの時点で明記しておく（実際の宣言・使用は Step8）。

### Step 2. `fetchPokemonList` の実装（TDD）

- **テスト項目提示**（`src/lib/pokemon/api.test.ts`）:
  1. 正常系: `fetch` が `https://pokeapi.co/api/v2/pokemon?limit=20&offset=0` を呼び、`{count, results}` を返すこと（offset計算: `(page - 1) * 20`）。
  2. `page=2` のとき offset が `20` になること。
  3. `fetch` に `next: { revalidate: ... }` オプションが渡されること（キャッシュ活用の要件検証）。
  4. HTTPエラー（`res.ok === false`）時に例外を投げる、またはエラーを表す戻り値になること（実装方針に応じて決定）。
- **Red**: 上記テストを `vi.stubGlobal('fetch', vi.fn())` を使って先に書き、失敗を確認。
- **Green**: `src/lib/pokemon/api.ts` に `fetchPokemonList(page: number): Promise<PokemonListResponse>` を実装してテストを通す。
- **Refactor**: `PAGE_SIZE` 定数の切り出し、offset計算のユーティリティ化。

### Step 3. `fetchPokemonDetails`（N+1並列フェッチ）の実装（TDD）

- **テスト項目提示**（`src/lib/pokemon/api.test.ts` に追加）:
  1. `results: [{name, url}, ...]`（20件）を渡すと、各 `url` に対して `fetch` が呼ばれること（`Promise.allSettled` で並列。呼び出し回数 = 件数）。
  2. 各詳細レスポンスから `id`, `name`, `imageUrl`（`sprites.other['official-artwork'].front_default`）, `types`（`type.name` の配列）を抽出した整形済みオブジェクトの配列を返すこと。
     2-1. **（確定）画像URLが `null` の場合のフォールバック**: `sprites.other['official-artwork'].front_default` が `null` の詳細レスポンスを渡した場合、`toPokemonSummary` は `imageUrl` に `null` をそのまま保持する（もしくは呼び出し側 `PokemonCard` が `null` を判定してプレースホルダーに差し替えられるよう、`PokemonSummary.imageUrl` の型を `string | null` とする）。`fetchPokemonDetails`/`toPokemonSummary` 自身はプレースホルダー画像のパス解決を行わず、`null` をそのまま返す責務にとどめ、実際のフォールバック表示は Step6 の `PokemonCard` 側で行う。
  3. **（確定）詳細fetch個別失敗時の挙動**: `results` のうち1件（例: 2件目）だけ `fetch` がエラー（`res.ok === false` または reject）を返すとき、`fetchPokemonDetails` はページ全体を失敗させず、失敗した1件をスキップ（またはタイプ無し・画像フォールバックの `PokemonSummary` として補完）し、残り19件分の `PokemonSummary` を返すこと。`Promise.all` ではなく `Promise.allSettled` を使い、`status === 'rejected'` または `res.ok === false` の要素を除外/フォールバックする実装とする。
  4. 全件が失敗した場合は空配列を返す（呼び出し元の `page.tsx` 側でカードが0件になり、必要ならエラーメッセージ表示の余地を残す）。
  5. 詳細fetchにも `next: { revalidate: ... }` オプションが渡されること。
- **Red**: テストを先に書き失敗を確認。
- **Green**: `fetchPokemonDetails(results: {name:string; url:string}[]): Promise<PokemonSummary[]>` を実装（内部で `Promise.allSettled(results.map(r => fetch(r.url, {next:{revalidate}})...))`、失敗要素をフィルタ/フォールバック）。
- **Refactor**: レスポンス整形処理の関数分離（`toPokemonSummary(detail: PokemonDetail): PokemonSummary`）、型ガード整理、失敗フィルタ処理の関数分離（`isFulfilled` ガード等）。

### Step 4. `fetchPokemonPage`（一覧+詳細+ページ数の統合ヘルパー）の実装（TDD）

- **テスト項目提示**:
  1. `fetchPokemonPage(page)` が `fetchPokemonList` → `fetchPokemonDetails` の順に内部で呼び出し、`{ items: PokemonSummary[], totalPages: number, currentPage: number }` を返すこと。
  2. `totalPages` が `Math.ceil(count / 20)` で計算されること。
  3. **（確定）`normalizePage` ヘルパー**: 不正な `page` クエリ文字列（`undefined`、`"abc"`、`"-1"`、`"0"`、`"9999"` 等の範囲外の値）を渡すと `1` を返し、`"3"` のような正当な値を渡すとそのまま `3`（数値）を返すこと。範囲チェック（`totalPages` を超える値のフォールバック）を `fetchPokemonPage` 内部で行うか `normalizePage` に `totalPages` を渡すかは実装時に選択してよいが、いずれの場合も最終的に `notFound()` を呼ばず1ページ目にフォールバックする挙動をテストで固定する。
  4. **（確定）`normalizePage` と `totalPages` 連携フロー**: `totalPages` は一覧APIのレスポンス（`count`）からしか得られず、`page` の妥当性判定には `totalPages` が必要という鶏卵関係になるため、`fetchPokemonPage(rawPage: string | undefined)` は内部で次の2段階フローを取ることを確定する。
     1. まず `normalizePage(rawPage, undefined)` で「数値として解釈可能か・正の整数か」だけをチェックした暫定ページ番号（不正なら `1`）を算出し、その暫定ページ番号で `fetchPokemonList(page)` を1回実行して `count`（＝`totalPages = Math.ceil(count / PAGE_SIZE)`）を取得する。
     2. 取得した `totalPages` を使って `normalizePage(rawPage, totalPages)` を再評価する。暫定ページ番号が `totalPages` を超えていた場合（例: `page=9999` で `totalPages=52`）は最終ページ番号を `1` に確定し、暫定フェッチが1ページ目相当（offset 0）でなかった場合に限り `fetchPokemonList(1)` を取り直す。暫定フェッチが既に1ページ目相当だった場合（`rawPage` が非数値・負数・`0` 等で最初から `1` にフォールバックしているケース）は再フェッチ不要でそのまま結果を使い回す。
     3. 最終的に確定したページ番号の一覧結果（`results`）を使って `fetchPokemonDetails` を呼び出す。
        この2段階フロー（暫定フェッチ→`count`確定→必要なら1ページ目相当で再フェッチ）を、`page=9999`（範囲外・再フェッチが発生するケース）と `page=abc`（非数値・最初から1ページ目なので再フェッチ不要なケース）の両方でテストする。
- **Red/Green/Refactor**: 上記手順で実装。このステップで Step2/3 の関数をモックせず、`fetch` 自体をモックした統合的な単体テストとする（あるいは `fetchPokemonList`/`fetchPokemonDetails` を `vi.mock` してユニット化するかは実装時に選択）。`fetch` 呼び出し回数のアサーションで、再フェッチが発生するケース／不要なケースの回数差を明示的に検証する。

### Step 5. `PokemonTypeBadge` コンポーネント（TDD）

- **テスト項目提示**（`src/components/PokemonTypeBadge.test.tsx`）:
  1. `type="fire"` のとき「ほのお」等の表示名（または `fire` そのまま。表記方針は実装時に決定）とタイプ別の背景色クラス/style が適用されること。
  2. 未知のタイプ名が渡された場合のフォールバック配色があること。
- **Red/Green/Refactor**: タイプ→配色のマッピングオブジェクトを実装し、DESIGN.mdへの追記（Step9）と整合させる。

### Step 6. `PokemonCard` コンポーネント（TDD）

- **テスト項目提示**（`src/components/PokemonCard.test.tsx`）:
  1. `name`, `id`, `imageUrl`, `types` を渡すと、名前・図鑑番号（例: `No. 0001` 形式）・画像（`alt` 属性含む）・タイプバッジが描画されること。
  2. `types` が複数（例: `['grass', 'poison']`）のとき、バッジが複数表示されること。
  3. **（確定）`imageUrl` が `null` の場合のフォールバック**: `imageUrl={null}` を渡すと、PokeAPIの画像URLの代わりにプレースホルダー画像（`public/` 配下のローカルアセット、例: `/pokemon-placeholder.png` 等の固定パス）が `<Image src="...">` に設定されて描画されること（`next/image` が `src={null}` でエラーにならないことをテストで担保する）。プレースホルダー画像アセット自体の追加は本Stepの実装内で行う。
- **Red/Green/Refactor**: `PokemonTypeBadge` を内部で利用して実装。DESIGN.mdのカードスタイル（角丸8px、背景 `#f5f5f7` 等）を適用。`imageUrl` が `null` のときプレースホルダーパスにフォールバックする分岐を実装する。

### Step 7. `Pagination` コンポーネント（TDD）

- **テスト項目提示**（`src/components/Pagination.test.tsx`）:
  1. `currentPage=1, totalPages=5` のとき、`1 2 3 4 5` のページリンクが `<Link>`（`role="link"`）として描画されること。
  2. 現在ページがハイライト表示される（例: `aria-current="page"`）こと。
  3. **（確定）省略記号ロジック**: `getPaginationRange(currentPage, totalPages)` の仕様として、以下の2段階ルールを確定する。
     1. **小規模しきい値による全件表示**: `totalPages <= 7` の場合は、常に `1` 〜 `totalPages` の全ページ番号をそのまま表示し、`...` は一切使わない（先頭・末尾・現在ページ±1という区分をそもそも適用しない）。このしきい値7は「先頭1・末尾1・現在ページ前後1（最大3）・省略記号2個分」を全部展開しても収まる最小限の目安として採用する。
     2. **`totalPages > 7` の場合の truncate 方式**: 先頭ページ（1）・末尾ページ（`totalPages`）・現在ページの前後1ページ（`currentPage - 1` 〜 `currentPage + 1`、範囲外は無視）を常に表示対象（`visible` 集合）とする。`visible` を昇順に並べたとき、隣接する2つの表示ページの間に挟まれる「隠れるページ」の区間ごとに次のルールを適用する。
        - 隠れる区間の長さが **2ページ以上**の場合は、その区間をまとめて1つの `...`（非リンクの `<span aria-hidden="true">` 等）に置き換える。
        - 隠れる区間の長さが **ちょうど1ページ**の場合は、`...` を使わずそのページ番号をそのまま表示する（`...` で1ページ分だけを隠しても表示幅が変わらず無駄なため）。
        - 隠れる区間が存在しない（長さ0）場合は何も挿入しない。
     - テストケース例:
       - `currentPage=1, totalPages=52`（>7 のため truncate 方式）→ `visible={1,2,52}`、`2`と`52`の間の隠れる区間長は49（≥2）→ `1 2 ... 52`
       - `currentPage=27, totalPages=52` → `visible={1,26,27,28,52}` → `1 ... 26 27 28 ... 52`
       - `currentPage=52, totalPages=52` → `visible={1,51,52}` → `1 ... 51 52`
       - `currentPage=1, totalPages=5`（≤7 のため常に全件表示）→ `1 2 3 4 5`
       - `currentPage=2, totalPages=5`（≤7 のため常に全件表示）→ `1 2 3 4 5`
       - （参考・境界値の追加ケース）`currentPage=4, totalPages=9`（>7 のため truncate 方式）→ `visible={1,3,4,5,9}`、`1`と`3`の間の隠れる区間は`{2}`で長さ1 → `...` を使わず `2` をそのまま表示: `1 2 3 4 5 ... 9`。この境界値ケースを `getPaginationRange` の単体テストに追加し、「隠れるページ数が1個だけなら`...`を使わず数字を出す」ルールを直接検証する。
  4. 各リンクの `href` が `?page=n` 形式であること。
  5. `...` 部分はクリック不可（`<Link>` ではなく装飾用の `<span aria-hidden="true">` 等）であること。
- **Red/Green/Refactor**: 上記手順で実装。省略ロジックは専用関数（例: `getPaginationRange(currentPage, totalPages): (number | '...')[]`）として切り出し、単体テストで境界値（`totalPages<=7`の全件表示ケース・先頭付近・末尾付近・中間・隠れる区間が1ページだけのケース）を固定する。

### Step 8. `src/app/pokemon-list/page.tsx` の実装（統合・TDD）

- **テスト項目提示**（`src/app/pokemon-list/page.test.tsx`、`fetch` を `vi.stubGlobal` でモックしページ全体を `render`）:
  1. **（確定）`searchParams` の型と `await`**: `page.tsx` は Next.js 16 の実際のAPIに合わせ、`type Props = { searchParams: Promise<{ page?: string | string[] }> }` を受け取る `async` Server Component として実装する（`searchParams` は同期オブジェクトではなく `Promise` として渡されるため、コンポーネント本体の先頭で `const { page: rawPage } = await searchParams;` のように必ず `await` してから値を取り出すこと。同期アクセスは Next.js 15 以降で廃止されているため使用しない）。この `page.tsx` を呼び出すと、20件分の `PokemonCard` が描画されること（`fetch` モックが一覧+20件の詳細を返すよう設定）。
  2. `searchParams`（`await` 後）の `page` が未指定のとき1ページ目として扱われること。
  3. **（確定）不正な `page` の扱い**: `page=abc`（非数値）、`page=-1`（負数）、`page=0`、`page=9999`（範囲外）のいずれの場合も `notFound()` を呼ばず、1ページ目の内容（`fetchPokemonPage(1)` 相当）にフォールバックして正常にレンダリングされること。この正規化処理は `page.tsx` 内、または `src/lib/pokemon/api.ts` に `normalizePage(rawPage: string | undefined, totalPages?: number): number` のようなヘルパーとして切り出し、単体テストを設ける（`Step 4` に追加。`normalizePage` と `totalPages` の連携フローは Step4 の確定仕様を参照）。
  4. `Pagination` に正しい `currentPage`/`totalPages` が渡り描画されること。
  5. 一覧APIの取得自体が失敗した場合（データ取得失敗）は、専用のエラーUI（`notFound()` は使わない）が表示されること。
- **Red/Green/Refactor**: `metadata`（`title: 'ポケモン一覧'` 等）を export しつつ、`await searchParams` した上で `fetchPokemonPage` を呼び出し `PokemonCard` 群と `Pagination` を描画する実装を行う。register の `page.tsx` と同様、レイアウト（見出し・コンテナ）は `page.tsx` に置く。

Server Component のテストについて: Next.js の `async` Server Component を `@testing-library/react` の `render` に直接渡す場合、コンポーネントが返す Promise を `await` してから渡す（`render(await PokemonListPage({ searchParams }))` のようなパターン）必要がある可能性がある。既存プロジェクトに Server Component の `render` テスト実績がないため、Step 8 着手時に実際の Next.js/React バージョン（Next 16.1.6 / React 19.2.3）での挙動を確認し、必要ならテスト手法を調整する。

### Step 9. next.config.mjs / DESIGN.md の更新

- **（確定）** `next.config.mjs` に `images.remotePatterns` を追加し、`hostname: 'raw.githubusercontent.com'`（PokeAPI の official-artwork 画像ホスト）を許可する。`next/image` の `<Image>` を Step6 (`PokemonCard`) で使用するため、この設定が無いとビルド/実行時にエラーになる点に注意。
- `DESIGN.md` に「ポケモンタイプバッジはこのデザインシステムの例外であり、タイプ別の慣用色を使用する」旨を追記（Do's/Don'ts セクション末尾、または新規サブセクション）。
- コード変更ではないためTDD対象外（ただし `next.config.mjs` 変更後は `PokemonCard` の `<Image>` が実際に描画できることを Step6/Step8 のテストまたは `vp run dev` の目視確認で確認する）。

### Step 10. 仕上げ

- `vp check`（フォーマット・lint・型チェック）を実行し、全て通過することを確認。
- `vp test` を実行し、全テストがGreenであることを確認。
- 手動確認（開発サーバー起動 `vp run dev` で `/pokemon-list` を目視確認）はユーザー側で実施、もしくは実装エージェントに委ねる。

## 未解決の論点

以下の5点はユーザー判断により決定済み（2026-07-13）。参考として決定内容を記録する。

1. **不正な `page` クエリの扱い**（決定済み）: 範囲外・非数値・負数を含め、すべて1ページ目にフォールバックする。`notFound()` は使わない。データ取得自体の失敗時は専用エラーUIを表示する（`notFound()` は使わない）。→ Step4/Step8 に反映済み。
2. **詳細fetch失敗時の挙動**（決定済み）: 個別失敗時は該当ポケモンのカードをスキップ、またはタイプ無しでフォールバック表示する。ページ全体は失敗させない。→ Step3 に反映済み。
3. **ページ番号一覧の省略ロジック**（決定済み）: `totalPages <= 7` は常に全ページ表示。`totalPages > 7` の場合は先頭ページ・末尾ページ・現在ページの前後1ページを表示し、それ以外の隠れる区間は長さ2ページ以上なら `...` に置き換え、長さ1ページなら数字をそのまま表示する。→ Step7 に反映済み（`getPaginationRange` の確定仕様）。
4. **画像表示**（決定済み）: `next/image` を採用する。`next.config.mjs` に `images.remotePatterns`（`raw.githubusercontent.com`）を追加する。画像URLが `null` の場合はローカルのプレースホルダー画像（`public/pokemon-placeholder.png` 等）にフォールバックする。→ Step6/Step9 に反映済み。
5. **ポケモン名・タイプ名の表示言語**（決定済み）: 多言語対応は行わない。PokeAPIが返す英語表記のまま表示する。翻訳レイヤーは設けない。
6. **`searchParams` の型（決定済み・Next.js 16 実APIに準拠）**: `Promise<{ page?: string | string[] }>` として受け取り、`await searchParams` してから値を取り出す。同期アクセスは使用しない。→ Step1/Step8 に反映済み。
7. **`normalizePage` と `totalPages` の連携フロー（決定済み）**: 暫定ページ番号（`totalPages` 未確定の状態での数値妥当性チェックのみ）で1回目のフェッチを行い `count`/`totalPages` を確定させ、暫定ページ番号が範囲外だった場合のみ1ページ目相当で再フェッチする2段階フローとする。→ Step4 に反映済み。

現時点で残っている未解決の論点はなし。
