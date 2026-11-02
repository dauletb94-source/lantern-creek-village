#!/bin/bash
# Publish to GitHub Pages (repo must exist & remote "origin" set, Pages = main branch / root)
cd "$(dirname "$0")" && git add -A && git commit -qm "update village $(date +%F)" && git push -q origin main && echo deployed
