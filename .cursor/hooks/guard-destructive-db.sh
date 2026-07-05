#!/bin/bash
# beforeShellExecution — ask before destructive database commands.

input=$(cat)
command=$(echo "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('command',''))" 2>/dev/null || echo "")

if echo "$command" | grep -qiE 'migrate reset|db push --force-reset|DROP DATABASE|DROP SCHEMA|TRUNCATE|prisma db execute.*DELETE FROM'; then
  cat <<'EOF'
{
  "permission": "ask",
  "user_message": "This command can destroy or wipe database data. Confirm you want to proceed.",
  "agent_message": "Destructive database command blocked pending user approval."
}
EOF
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
