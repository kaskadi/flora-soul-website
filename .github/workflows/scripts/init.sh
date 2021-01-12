#!/bin/bash
REPO="$(basename `git rev-parse --show-toplevel`)"
sed -i "s/template-synced-repo/${REPO}/g" README.md
git add .
git rm .github/workflows/init.yml
git rm .github/workflows/scripts/init.sh
git commit -S -m "Initialized repository with correct naming"
git push