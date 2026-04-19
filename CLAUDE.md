# プロジェクト概要

このプロジェクトはReact/Next.jsの最新情報をキャッチアップする環境です
Next.jsのapp routerを使用しています。
appディレクトリ配下のディレクトリ毎に１つのトピックについてまとめる予定です。

---

# アーキテクチャ

このプロジェクトは **Vite+** を使用しています。Vite+は Vite、Rolldown、Vitest、tsdown、Oxlint、Oxfmt、Vite Task を統合したウェブ向け統合ツールチェーンです。グローバル CLI `vp` を通じてランタイム管理、パッケージ管理、フロントエンドツールを一元管理します。

フレームワークはNext.jsを使用しています。

# 開発コマンド

**`pnpm` や `npm` を直接使用しないこと。すべての操作は `vp` コマンドで行う。**

## よく使うコマンド

```bash
vp run dev          # 開発サーバー起動
vp run build        # プロダクションビルド
vp check        # フォーマット・lint・型チェックを一括実行
vp lint         # lint のみ実行
vp fmt          # フォーマットのみ実行
vp test         # テスト実行
vp install --frozen-lockfile      # 依存関係インストール
```

## 依存関係管理

```bash
vp add <pkg>     # パッケージ追加
vp add -D <pkg>     # パッケージ追加（devDependencies）
vp remove <pkg>  # パッケージ削除
vp update        # パッケージ更新
```

---

# 注意事項（必ず守ること）

- **パッケージマネージャーを直接使わない**: `pnpm`、`npm`、`yarn` は使用しない。`vp` がすべてのパッケージマネージャー操作を担う。
- **ツール実行は必ず `vp` 経由**: `vp vitest` や `vp oxlint` は存在しない。`vp test`・`vp lint` を使う。
- **Vitest・Oxlint・Oxfmt・tsdown を直接インストールしない**: Vite+ に内包されているため不要。
- **モジュールのインポートは `vite-plus` から**: `vite` や `vitest` からではなく、`vite-plus` からインポートする。
  ```ts
  import { defineConfig } from 'vite-plus';
  import { expect, test, vi } from 'vite-plus/test';
  ```
- **one-off バイナリは `vp dlx` を使う**: `npx` や `pnpm dlx` は使わない。
- **型チェック付き lint**: `vp lint --type-aware` で動作する。`oxlint-tsgolint` は不要。

---

# 作業開始チェックリスト

- [ ] リモートの変更を取り込んだ後は `vp install` を実行する
- [ ] 変更を加えたら `vp check` と `vp test` で検証する
