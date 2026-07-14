This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## プランチームによる開発（plan-team-orchestrator）

このプロジェクトには、**計画 → レビュー → 実装 → レビュー** の一連のワークフローを自動で回すスキル `plan-team-orchestrator` が用意されています（定義は `.claude/skills/plan-team-orchestrator/SKILL.md`）。このスキルが全体を統括し、内部で次の3つのサブエージェント（定義は `.claude/agents/`）を協調させて最終結果まで進めます。

- **plan-writer**（計画） — コードベースを調査して実装計画を作成
- **plan-reviewer**（レビュー） — 計画の妥当性と実装の忠実性をチェック
- **plan-implementer**（実装） — 承認された計画に沿ってコードを実装し、`vp` で検証

各工程を個別に呼び出す必要はなく、`/plan-team-orchestrator` を実行するだけで、計画の修正ループや実装後のレビュー・修正までまとめて実行されます。

```text
例: /plan-team-orchestrator パスワードリセット機能を追加
→ プランチームが一連のワークフローを実行し、最終結果を報告
```

モデル割り当て:

| 名前                   | 種別             | 役割     | model                        |
| ---------------------- | ---------------- | -------- | ---------------------------- |
| plan-team-orchestrator | スキル           | 全体統括 | 呼び出し側セッションのモデル |
| plan-writer            | サブエージェント | 計画     | Sonnet（最新）               |
| plan-implementer       | サブエージェント | 実装     | Sonnet（最新）               |
| plan-reviewer          | サブエージェント | レビュー | Opus（最新）                 |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
