#!/bin/bash
# Stop hook: UI関連ファイルに未コミットの変更があり、かつ
# playwright-explore-website / playwright-automation-fill-in-form スキルによる
# 検証がまだ行われていない場合、Stopをブロックしてスキル実行を促す。
set -euo pipefail

cd "$(dirname "$0")/../.."

changed=$(git status --porcelain -- src/app src/components 2>/dev/null \
  | awk '{print $2}' \
  | grep -E '(^src/app/.*/page\.tsx$)|(Client\.tsx$)|(^src/components/.*\.tsx$)' \
  | grep -v '\.test\.tsx$' || true)

if [ -z "$changed" ]; then
  exit 0
fi

newest_change=0
while IFS= read -r f; do
  [ -f "$f" ] || continue
  mtime=$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f" 2>/dev/null || echo 0)
  if [ "$mtime" -gt "$newest_change" ]; then
    newest_change=$mtime
  fi
done <<< "$changed"

marker=".claude/hooks/.last-verified"
marker_time=0
if [ -f "$marker" ]; then
  marker_time=$(cat "$marker")
fi

if [ "$newest_change" -gt "$marker_time" ]; then
  files=$(echo "$changed" | tr '\n' ' ' | sed 's/ $//')
  msg="UI関連ファイルが変更されています（${files}）。playwright-explore-website または playwright-automation-fill-in-form スキルで動作確認してから終了してください。"
  jq -n --arg m "$msg" '{decision: "block", reason: $m}'
fi
