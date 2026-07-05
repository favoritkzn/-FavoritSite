#!/bin/bash
# sessionStart — inject PostgreSQL/Prisma context for this project.

cat <<'EOF'
{
  "additional_context": "PostgreSQL is configured for this project.\n\n- DATABASE_URL: postgresql://favorit:favorit@localhost:5432/favorit\n- Schema: packages/database/prisma/schema.prisma\n- DB commands: pnpm db:generate | db:push | db:migrate | db:seed | db:studio\n- Health check: bash scripts/db-check.sh\n- psql PATH: /Applications/Postgres.app/Contents/Versions/latest/bin\n\nRelevant skills: prisma-database-setup, prisma-client-api, prisma-cli, postgres-best-practices, database-design.\n\nNever run migrate reset, DROP DATABASE, or TRUNCATE without explicit user approval."
}
EOF
exit 0
