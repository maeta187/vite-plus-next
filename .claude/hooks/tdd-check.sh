#!/bin/sh
# Stop hook: runs after Claude finishes a turn.
# Executes `vp check` (format/lint/typecheck) and `vp test`, and reports
# a pass/fail summary back to the user without blocking the turn.
set -u
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || true

check_out=$(vp check 2>&1)
check_status=$?

test_out=$(vp test 2>&1)
test_status=$?

if [ "$check_status" -eq 0 ] && [ "$test_status" -eq 0 ]; then
  msg="✅ vp check / vp test: 全て成功しました"
else
  msg="⚠️ vp check / vp test で問題が見つかりました (check: exit $check_status, test: exit $test_status)。詳細は手動で \`vp check\` / \`vp test\` を実行して確認してください。"
fi

jq -n --arg m "$msg" '{systemMessage: $m}'
