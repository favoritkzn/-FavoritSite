#!/bin/bash
# sessionStart — inject Docker dev context.

cat <<'EOF'
{
  "additional_context": "Docker local stack for this project:\n\n- Compose: docker/docker-compose.yml\n- Start: bash scripts/docker-up.sh (or pnpm docker:up)\n- Check: bash scripts/docker-check.sh\n- Services: PostgreSQL :5432, Redis :6379, MinIO :9000/:9001\n- Uploads: set S3_ENABLED=true in .env when MinIO is running\n- MinIO console: http://localhost:9001 (minioadmin/minioadmin)\n\nIf port 5432 is already used by local Postgres, docker-up skips Docker Postgres.\nNever run `docker compose down -v` without user approval.\n\nSkill: docker-expert."
}
EOF
exit 0
