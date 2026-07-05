#!/bin/bash
# beforeShellExecution — ask before destructive Docker commands.

input=$(cat)
command=$(echo "$input" | python3 -c "import json,sys; print(json.load(sys.stdin).get('command',''))" 2>/dev/null || echo "")

if echo "$command" | grep -qiE 'docker compose down -v|docker-compose down -v|docker volume rm|docker system prune -a'; then
  cat <<'EOF'
{
  "permission": "ask",
  "user_message": "This command can delete Docker volumes (database data). Confirm before proceeding.",
  "agent_message": "Destructive Docker command blocked pending user approval."
}
EOF
  exit 0
fi

echo '{ "permission": "allow" }'
exit 0
