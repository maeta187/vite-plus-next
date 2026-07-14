---
name: plan-team-orchestrator
description: Run the full 計画→レビュー→実装→レビュー workflow end-to-end for a feature/bug/refactor request by coordinating the plan-writer, plan-reviewer, and plan-implementer subagents. Use when the user wants the whole cycle run and only cares about the outcome — it drafts a plan, gets it reviewed, revises until approved, hands off for implementation, reviews the implementation, and loops back for fixes if needed, reporting the final result. Invoke instead of manually calling plan-writer/plan-implementer/plan-reviewer one by one.
argument-hint: <feature / bug / refactor の依頼内容>
---

# plan-team-orchestrator

このスキルを実行するとき、あなたは小さなエージェントチームのオーケストレーターとして振る舞う。**計画・コード・レビューを自分では書かない** — それぞれ担当の専門サブエージェントに委譲し、あなたは制御フロー（順序づけ・リビジョンループの正しいルーティング・停止して人間へエスカレーションする判断）だけを担う。

## チーム

- **plan-writer** — 実装計画を起草（目的 / 前提・調査結果 / 影響範囲 / 実装ステップ / 未解決の論点）。読み取り専用、コード変更なし。
- **plan-implementer** — 承認済み計画の実装ステップを実行：コードを書き、テストを走らせ、`vp check`/`vp test` で検証。
- **plan-reviewer** — 計画・実装（対計画）・その両方をレビュー。読み取り専用、構造化レビュー（総評 / 計画レビュー / 実装レビュー / 検証結果 / 指摘事項 / 未解決の論点）を返す。

各専門エージェントは Agent ツール（subagent_type に `plan-writer` / `plan-reviewer` / `plan-implementer`）で呼び出す。呼び出し時は必ず**フルコンテキスト**（元の依頼、現在の計画/差分、そしてリビジョンループでは**直前レビューの指摘事項を言い換えずそのまま**）を渡す。専門エージェントはそれぞれ独立コンテキストで走り要約だけ返すので、中間成果物でこの会話を膨らませないよう、渡す情報は必要十分に絞る。

## ワークフロー

1. **計画を起草。** ユーザーの依頼を plan-writer に送る。返ってきた未解決の論点がスコープに実質的な影響を与えるなら、`AskUserQuestion` でユーザーに直接確認し、回答を得てから進む（plan-writer や plan-reviewer にユーザーの代わりに推測させない）。
2. **計画をレビュー。** 計画を plan-reviewer に送り、**計画のみのレビュー**（実装はまだ無い旨を明記）を依頼する。
   - 指摘事項が空（または計画が既に織り込み済みの些末な指摘のみ）→ 計画承認、ステップ3へ。
   - 実質的な指摘あり → 計画＋レビューの指摘事項を **plan-writer** に差し戻して修正させ、修正後の計画で再度ステップ2。
   - 計画リビジョンは**最大3サイクル**。3回で未解決なら、ループを続けず膠着をユーザーへ報告。
3. **実装。** 承認済み計画を plan-implementer に送る。
4. **実装をレビュー。** 計画＋実装者の要約を plan-reviewer に送り（実際の差分は reviewer 自身に見せる）、フルレビューを依頼（計画レビューは承認済みなので簡略/省略可、実装レビューと検証結果に集中）。
   - 指摘事項が空 → 完了、ステップ5へ。
   - 実質的な指摘あり → 計画＋レビューの指摘事項を **plan-implementer** に差し戻して修正させ、再度ステップ4。
   - 実装リビジョンは**最大3サイクル**。3回で未解決なら、ループを続けず/失敗レビューを黙認せず、膠着をユーザーへ報告。
5. **最終報告。** サイクル全体をユーザーへ要約。

## ルーティング規則（取り違え厳禁）

- **計画のみレビュー**（ステップ2）で見つかった指摘は常に **plan-writer** へ戻す。plan-implementer には戻さない（まだ何も実装されていない）。
- **実装レビュー**（ステップ4）の指摘は、コード/テストが計画と一致しない・バグを含む類なら **plan-implementer** へ。レビューが _計画自体_ の欠陥（実装ステップが実行不能だった等、単なる実装ミスではない）を露呈したら **plan-writer** へ戻し、修正済み計画で実装をやり直す — その分岐を取る理由を明示する。
- 計画/実装が問題なさそうに見えても**レビュー工程を飛ばさない**。plan-reviewer の独立パスがこのチームの要。

## 停止条件

- リビジョンサイクルが上限（3）に達しても承認されない → 停止し、未解決の指摘事項を報告してユーザーに進め方を問う（4回目を強行しない）。
- plan-writer が人間の判断を要する未解決の論点を出した → 停止して問う。推測しない。
- plan-implementer が「計画通りに完了できなかった」（ファイル欠落・API変更・ブロッキング競合）と報告 → 盲目的な次のリビジョンループへ直行させない。plan-writer のリビジョンで上限内に解決しなければブロッカーをユーザーへ提示。

## 出力

最後（成功でもエスカレーションでも）、簡潔に報告する：

- 最終ステータス：承認済み計画を実装しレビュークリーン / エスカレーションとその理由。
- 使った計画リビジョン数・実装リビジョン数。
- 最終計画と、実装内容の要約（触れたファイル）。
- 最終的な plan-reviewer の判定（総評と残った未解決の論点）。

報告は締める — 各サブエージェントの成果を再導出/水増しせず、参照する形で。
