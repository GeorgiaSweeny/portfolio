#!/usr/bin/env bash
# Run an old version of the site locally, for comparison (see REDESIGN.md).
#   tools/view-old-site.sh site-design-2026-11      (or any tag, e.g. pre-restructure)
# Checks the tag out as a git worktree in ../archive/site-<tag> (next to site/, outside the repo),
# installs its packages and serves it at http://localhost:8081. It shows that day's content too.
# Stop it with Ctrl-C; delete the folder (git worktree remove ../archive/site-<tag>) when done.
set -euo pipefail
tag="${1:?Usage: tools/view-old-site.sh <tag>   (git tag -l lists them)}"
cd "$(git rev-parse --show-toplevel)"
git fetch --tags --quiet origin || true
git rev-parse -q --verify "refs/tags/$tag" >/dev/null || { echo "No tag called $tag. Tags:"; git tag -l; exit 1; }
dir="../archive/site-$tag"
if [ ! -d "$dir" ]; then
  mkdir -p ../archive
  git worktree add --detach "$dir" "$tag"
fi
cd "$dir"
[ -d node_modules ] || npm ci
echo "Serving $tag at http://localhost:8081 (Ctrl-C to stop)"
npx @11ty/eleventy --serve --port=8081
