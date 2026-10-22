#!/usr/bin/env bash
# ============================================================================
# tools/merge-files.sh
#
# Marefiyaye multi-file merger.
#
# Why this tool exists:
#   - Reading/reviewing many files at once is easiest in a single text artifact.
#   - Copy-pasting files one by one into chat loses context and separator clarity.
#   - This script produces a stable, diffable "merged file" with markers that
#     any developer or tool can parse.
#
# Usage:
#   ./tools/merge-files.sh <phase-name> <file1> <file2> ...
#   ./tools/merge-files.sh <phase-name> --from-list <listfile>
#
# Examples:
#   ./tools/merge-files.sh p0e-api \
#     apps/api/src/config/env.js \
#     apps/api/src/config/db.js \
#     apps/api/src/db/migrations/run.js
#
#   ./tools/merge-files.sh p0e-migrations --from-list migrations.txt
#     (migrations.txt contains one path per line)
#
# Output:
#   <phase-name>_files.txt in the current directory.
#
# Safety rules:
#   - Refuses to merge .env*, .env.local, .env.production, and any *.env file.
#   - Refuses to merge files inside node_modules/, .next/, dist/, build/, .git/.
#   - Skips binary-looking files unless --allow-binary is passed.
#   - Warns if any requested file is missing but continues (marks it MISSING).
# ============================================================================

set -u  # treat unset variables as errors
set -o pipefail  # propagate errors through pipelines

# ─────────────────────────────────────────────────────────────────────────────
# Defaults (override via env vars if needed, but do not modify the script)
# ─────────────────────────────────────────────────────────────────────────────
MERGE_EXTRA_EXCLUDES="${MERGE_EXTRA_EXCLUDES:-}"  # colon-separated extra excludes

# Deny-list: any path matching these patterns is refused unless the user
# passes --allow-protected. These protect secrets and generated artifacts.
DENY_PATTERNS=(
  "\.env$"
  "\.env\."
  "node_modules/"
  "\.next/"
  "dist/"
  "build/"
  "\.git/"
  "package-lock\.json"
)

# ─────────────────────────────────────────────────────────────────────────────
# Usage helper
# ─────────────────────────────────────────────────────────────────────────────
print_usage() {
  cat <<'USAGE'
Usage:
  ./tools/merge-files.sh <phase-name> <file1> <file2> ...
  ./tools/merge-files.sh <phase-name> --from-list <listfile>
  ./tools/merge-files.sh --help

Options:
  --from-list <listfile>   Read file paths from <listfile> (one per line, # = comment)
  --allow-protected        Allow merging files matching the deny-list (use carefully)
  --allow-binary           Allow merging files that contain binary bytes
  --out <output-file>      Override the output filename (default: <phase-name>_files.txt)
  --help                   Show this help

Environment:
  MERGE_EXTRA_EXCLUDES     Colon-separated extra deny-list patterns

Examples:
  ./tools/merge-files.sh p0e-config \
    packages/config/src/env/api.js \
    packages/config/src/env/web.js

  ./tools/merge-files.sh p0e-migrations --from-list migrations.txt
USAGE
}

# ─────────────────────────────────────────────────────────────────────────────
# Arg parsing
# ─────────────────────────────────────────────────────────────────────────────
PHASE_NAME=""
FROM_LIST=""
OUTPUT_OVERRIDE=""
ALLOW_PROTECTED=0
ALLOW_BINARY=0
FILE_ARGS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --help|-h)
      print_usage
      exit 0
      ;;
    --from-list)
      shift
      FROM_LIST="${1:-}"
      if [ -z "$FROM_LIST" ]; then
        echo "❌ --from-list requires a filename" >&2
        exit 1
      fi
      ;;
    --allow-protected)
      ALLOW_PROTECTED=1
      ;;
    --allow-binary)
      ALLOW_BINARY=1
      ;;
    --out)
      shift
      OUTPUT_OVERRIDE="${1:-}"
      if [ -z "$OUTPUT_OVERRIDE" ]; then
        echo "❌ --out requires a filename" >&2
        exit 1
      fi
      ;;
    --*)
      echo "❌ Unknown option: $1" >&2
      print_usage
      exit 1
      ;;
    *)
      if [ -z "$PHASE_NAME" ]; then
        PHASE_NAME="$1"
      else
        FILE_ARGS+=("$1")
      fi
      ;;
  esac
  shift
done

if [ -z "$PHASE_NAME" ]; then
  echo "❌ Missing <phase-name>. Try --help." >&2
  exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# Load file list from --from-list if provided
# ─────────────────────────────────────────────────────────────────────────────
if [ -n "$FROM_LIST" ]; then
  if [ ! -f "$FROM_LIST" ]; then
    echo "❌ List file not found: $FROM_LIST" >&2
    exit 1
  fi

  while IFS= read -r line; do
    # Trim leading/trailing whitespace
    line="$(echo "$line" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')"
    # Skip empty lines and comments
    [ -z "$line" ] && continue
    case "$line" in
      \#*) continue ;;
    esac
    FILE_ARGS+=("$line")
  done < "$FROM_LIST"
fi

TOTAL=${#FILE_ARGS[@]}

if [ "$TOTAL" -eq 0 ]; then
  echo "❌ No files to merge. Provide file paths or --from-list." >&2
  exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# Resolve output path
# ─────────────────────────────────────────────────────────────────────────────
if [ -n "$OUTPUT_OVERRIDE" ]; then
  OUTPUT="$OUTPUT_OVERRIDE"
else
  OUTPUT="${PHASE_NAME}_files.txt"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

# Returns 0 (true) if the given path matches the deny-list.
is_denied() {
  local path="$1"
  local pattern

  for pattern in "${DENY_PATTERNS[@]}"; do
    if echo "$path" | grep -Eq "$pattern"; then
      return 0
    fi
  done

  if [ -n "$MERGE_EXTRA_EXCLUDES" ]; then
    local IFS=':'
    for pattern in $MERGE_EXTRA_EXCLUDES; do
      [ -z "$pattern" ] && continue
      if echo "$path" | grep -Eq "$pattern"; then
        return 0
      fi
    done
  fi

  return 1
}

# Returns 0 (true) if the file looks binary (null bytes present in first 8 KB).
is_binary() {
  local path="$1"
  if command -v file >/dev/null 2>&1; then
    file --brief --mime-encoding "$path" 2>/dev/null | grep -q '^binary$' && return 0
  fi
  # Fallback: detect null bytes with od
  if command -v od >/dev/null 2>&1; then
    od -An -N 8000 -c "$path" 2>/dev/null | grep -q '\\0' && return 0
  fi
  return 1
}

# ─────────────────────────────────────────────────────────────────────────────
# Main merge loop
# ─────────────────────────────────────────────────────────────────────────────
INDEX=0
MISSING_COUNT=0
SKIPPED_COUNT=0
MISSING_LIST=""
SKIPPED_LIST=""

{
  echo "#################################################################################"
  echo "# MERGED FILES FOR: $PHASE_NAME"
  echo "# Generated: $(date)"
  echo "# Files requested: $TOTAL"
  echo "# Repository root: $(pwd)"
  echo "#################################################################################"

  for file in "${FILE_ARGS[@]}"; do
    INDEX=$((INDEX + 1))
    echo ""
    echo "================================================================================"

    # Protection: refuse .env*, node_modules, etc. unless --allow-protected
    if [ "$ALLOW_PROTECTED" -eq 0 ] && is_denied "$file"; then
      echo ">>> FILE [$INDEX/$TOTAL]: $file"
      echo "================================================================================"
      echo "[SKIPPED — matches protected pattern; pass --allow-protected to override]"
      echo "================================================================================"
      echo "<<< END FILE [$INDEX/$TOTAL]: $file (SKIPPED)"
      echo "================================================================================"
      SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
      SKIPPED_LIST="${SKIPPED_LIST}\n#   - $file (protected)"
      continue
    fi

    if [ -f "$file" ]; then
      # Protection: refuse binary files unless --allow-binary
      if [ "$ALLOW_BINARY" -eq 0 ] && is_binary "$file"; then
        echo ">>> FILE [$INDEX/$TOTAL]: $file"
        echo "================================================================================"
        echo "[SKIPPED — binary file; pass --allow-binary to override]"
        echo "================================================================================"
        echo "<<< END FILE [$INDEX/$TOTAL]: $file (SKIPPED)"
        echo "================================================================================"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        SKIPPED_LIST="${SKIPPED_LIST}\n#   - $file (binary)"
        continue
      fi

      local_lines=$(wc -l < "$file" | tr -d ' ')
      echo ">>> FILE [$INDEX/$TOTAL]: $file ($local_lines lines)"
      echo "================================================================================"
      echo ""
      cat "$file"
      echo ""
      echo "================================================================================"
      echo "<<< END FILE [$INDEX/$TOTAL]: $file"
      echo "================================================================================"
    else
      echo ">>> FILE [$INDEX/$TOTAL]: $file"
      echo "================================================================================"
      echo "[MISSING FILE]"
      echo "================================================================================"
      echo "<<< END FILE [$INDEX/$TOTAL]: $file (MISSING)"
      echo "================================================================================"
      MISSING_COUNT=$((MISSING_COUNT + 1))
      MISSING_LIST="${MISSING_LIST}\n#   - $file"
    fi
  done

  echo ""
  echo "#################################################################################"
  echo "# SUMMARY"
  echo "#   Requested : $TOTAL"
  echo "#   Included  : $((TOTAL - MISSING_COUNT - SKIPPED_COUNT))"
  echo "#   Missing   : $MISSING_COUNT"
  echo "#   Skipped   : $SKIPPED_COUNT"
  if [ "$MISSING_COUNT" -gt 0 ]; then
    echo "# MISSING FILES:"
    printf "$MISSING_LIST\n"
  else
    echo "# MISSING FILES: none"
  fi
  if [ "$SKIPPED_COUNT" -gt 0 ]; then
    echo "# SKIPPED FILES:"
    printf "$SKIPPED_LIST\n"
  else
    echo "# SKIPPED FILES: none"
  fi
  echo "#################################################################################"
} > "$OUTPUT"

OUTPUT_LINES=$(wc -l < "$OUTPUT" | tr -d ' ')
echo "✅ Created $OUTPUT ($OUTPUT_LINES lines)"

if [ "$MISSING_COUNT" -gt 0 ]; then
  echo "⚠️  $MISSING_COUNT file(s) were missing. See the SUMMARY section in $OUTPUT."
fi

if [ "$SKIPPED_COUNT" -gt 0 ]; then
  echo "⚠️  $SKIPPED_COUNT file(s) were skipped (protected or binary). See the SUMMARY section in $OUTPUT."
fi

exit 0