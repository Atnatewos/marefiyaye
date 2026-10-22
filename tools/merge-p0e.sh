#!/usr/bin/env bash
# ============================================================================
# tools/merge-p0e.sh
#
# One-shot convenience wrapper for the P0-E JS file set.
#
# Why this file exists:
#   - Every P0 phase gets reviewed through the same merge output format.
#   - This wrapper saves typing 4 long file paths each time.
#   - Phase-specific wrappers keep the merge tool itself generic and reusable.
#
# Usage:
#   ./tools/merge-p0e.sh
#
# Produces:
#   p0e-api_files.txt in the repo root.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

"$SCRIPT_DIR/merge-files.sh" p0e-api \
  apps/api/src/config/env.js \
  apps/api/src/config/db.js \
  apps/api/src/db/migrations/run.js \
  apps/api/src/db/seeds/seed.js