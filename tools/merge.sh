#!/usr/bin/env bash
# ============================================================================
# tools/merge.sh
#
# Marefiyaye multi-file merger — ONE script for everything.
#
# WHY THIS TOOL EXISTS:
#   - Reviewing many source files at once is easiest in a single artifact.
#   - Chat-based review loses context when pasting files individually.
#   - A deterministic merge with clear boundary markers is diffable.
#
# USAGE:
#   ./tools/merge.sh <phase-name> <file1> <file2> ...
#   ./tools/merge.sh <phase-name> --from-list <listfile>
#   ./tools/merge.sh <phase-name> --dir <directory> [--ext <ext1,ext2>]
#   ./tools/merge.sh --help
#
# EXAMPLES:
#   # Merge specific files
#   ./tools/merge.sh admin \
#     "apps/web/src/app/(admin)/admin/bank-accounts/_BankAccountsClient.jsx" \
#     "apps/web/src/components/ui/Modal.jsx" \
#     "apps/web/src/components/ui/Input.jsx"
#
#   # Merge every .jsx file under a directory (recursive)
#   ./tools/merge.sh admin-ui --dir apps/web/src/app/\(admin\)
#
#   # Merge every .js under apps/api
#   ./tools/merge.sh api --dir apps/api/src --ext .js
#
#   # Merge from a list file
#   ./tools/merge.sh p1 --from-list tools/lists/admin.txt
#
# SAFETY:
#   - Refuses .env*, node_modules/, .next/, dist/, build/, .git/
#   - Skips binary-looking files
#   - Warns about missing files
#
# OUTPUT:
#   <phase-name>_files.txt in the current directory (or --out <file>).
# ============================================================================

set -u
set -o pipefail

DENY_PATTERNS=(
  "\.env$"
  "\.env\."
  "node_modules/"
  "\.next/"
  "dist/"
  "build/"
  "\.git/"
  "package-lock\.json"
  "pnpm-lock\.yaml"
  "yarn\.lock"
)

print_usage() {
  cat <<'USAGE'
Usage:
  ./tools/merge.sh <phase-name> <file1> <file2> ...
  ./tools/merge.sh <phase-name> --from-list <listfile>
  ./tools/merge.sh <phase-name> --dir <directory> [--ext <ext1,ext2>]
  ./tools/merge.sh --help

Options:
  --from-list <file>       Read paths from <file> (one per line, # = comment)
  --dir <dir>              Recursively include every matching file under <dir>
  --ext <exts>             Comma-separated extensions to include (default: .js,.jsx)
  --allow-protected        Allow files matching the deny-list
  --allow-binary           Allow files with binary content
  --out <file>             Override the output filename
  --help                   Show this help
USAGE
}

PHASE_NAME=""
FROM_LIST=""
DIR=""
EXTS=".js,.jsx"
OUTPUT_OVERRIDE=""
ALLOW_PROTECTED=0
ALLOW_BINARY=0
FILE_ARGS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --help|-h) print_usage; exit 0 ;;
    --from-list) shift; FROM_LIST="${1:-}"; [ -z "$FROM_LIST" ] && { echo "❌ --from-list requires a filename" >&2; exit 1; } ;;
    --dir) shift; DIR="${1:-}"; [ -z "$DIR" ] && { echo "❌ --dir requires a directory" >&2; exit 1; } ;;
    --ext) shift; EXTS="${1:-}"; [ -z "$EXTS" ] && { echo "❌ --ext requires extensions" >&2; exit 1; } ;;
    --allow-protected) ALLOW_PROTECTED=1 ;;
    --allow-binary) ALLOW_BINARY=1 ;;
    --out) shift; OUTPUT_OVERRIDE="${1:-}"; [ -z "$OUTPUT_OVERRIDE" ] && { echo "❌ --out requires a filename" >&2; exit 1; } ;;
    --*) echo "❌ Unknown option: $1" >&2; print_usage; exit 1 ;;
    *)
      if [ -z "$PHASE_NAME" ]; then PHASE_NAME="$1"; else FILE_ARGS+=("$1"); fi
      ;;
  esac
  shift
done

[ -z "$PHASE_NAME" ] && { echo "❌ Missing <phase-name>. Try --help." >&2; exit 1; }

# Load from --from-list
if [ -n "$FROM_LIST" ]; then
  [ -f "$FROM_LIST" ] || { echo "❌ List file not found: $FROM_LIST" >&2; exit 1; }
  while IFS= read -r line; do
    line="$(echo "$line" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')"
    [ -z "$line" ] && continue
    case "$line" in \#*) continue ;; esac
    FILE_ARGS+=("$line")
  done < "$FROM_LIST"
fi

# Load from --dir
if [ -n "$DIR" ]; then
  [ -d "$DIR" ] || { echo "❌ Directory not found: $DIR" >&2; exit 1; }
  # Split exts by comma into find -name patterns
  IFS=',' read -ra EXT_LIST <<< "$EXTS"
  FIND_ARGS=()
  for e in "${EXT_LIST[@]}"; do
    [ -z "$e" ] && continue
    # If user wrote 'js' instead of '.js', normalize
    case "$e" in .*) ;; *) e=".$e" ;; esac
    [ ${#FIND_ARGS[@]} -gt 0 ] && FIND_ARGS+=("-o")
    FIND_ARGS+=("-name" "*${e}")
  done
  # Find and sort
  while IFS= read -r path; do
    FILE_ARGS+=("$path")
  done < <(find "$DIR" -type f \( "${FIND_ARGS[@]}" \) 2>/dev/null | sort)
fi

TOTAL=${#FILE_ARGS[@]}
[ "$TOTAL" -eq 0 ] && { echo "❌ No files to merge. Provide file paths, --from-list, or --dir." >&2; exit 1; }

if [ -n "$OUTPUT_OVERRIDE" ]; then
  OUTPUT="$OUTPUT_OVERRIDE"
else
  OUTPUT="${PHASE_NAME}_files.txt"
fi

is_denied() {
  local path="$1" pattern
  for pattern in "${DENY_PATTERNS[@]}"; do
    echo "$path" | grep -Eq "$pattern" && return 0
  done
  return 1
}

is_binary() {
  local path="$1"
  if command -v file >/dev/null 2>&1; then
    file --brief --mime-encoding "$path" 2>/dev/null | grep -q '^binary$' && return 0
  fi
  if command -v od >/dev/null 2>&1; then
    od -An -N 8000 -c "$path" 2>/dev/null | grep -q '\\0' && return 0
  fi
  return 1
}

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
    echo "# MISSING FILES:"; printf "$MISSING_LIST\n"
  else
    echo "# MISSING FILES: none"
  fi
  if [ "$SKIPPED_COUNT" -gt 0 ]; then
    echo "# SKIPPED FILES:"; printf "$SKIPPED_LIST\n"
  else
    echo "# SKIPPED FILES: none"
  fi
  echo "#################################################################################"
} > "$OUTPUT"

OUTPUT_LINES=$(wc -l < "$OUTPUT" | tr -d ' ')
echo "✅ Created $OUTPUT ($OUTPUT_LINES lines)"

if [ "$MISSING_COUNT" -gt 0 ]; then
  echo "⚠️  $MISSING_COUNT file(s) were missing. See $OUTPUT."
fi
if [ "$SKIPPED_COUNT" -gt 0 ]; then
  echo "⚠️  $SKIPPED_COUNT file(s) were skipped. See $OUTPUT."
fi
exit 0