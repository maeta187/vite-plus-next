#!/bin/bash
# PostToolUse(Skill)フック: playwright-explore-website / playwright-automation-fill-in-form
# スキルが実行されたら、検証済みマーカーに現在時刻を記録する。
set -euo pipefail

cd "$(dirname "$0")/../.."

input=$(cat)
skill=$(echo "$input" | jq -r '.tool_input.skill // empty')

case "$skill" in
  playwright-explore-website|playwright-automation-fill-in-form)
    mkdir -p .claude/hooks
    date +%s > .claude/hooks/.last-verified
    ;;
esac
