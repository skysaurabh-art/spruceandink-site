#!/usr/bin/env bash
# Builds public/index.html from src/page.html (the page source has no doctype/head wrapper).
set -euo pipefail
cd "$(dirname "$0")"
P=src/page.html
{ printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="icon" type="image/svg+xml" href="logo/spruce-ink-icon.svg">\n'
  awk '/^<style>/{exit} {print}' "$P"
  awk '/^<style>/{f=1} f&&/^<\/style>/{print; exit} f{print}' "$P"
  printf '</head>\n<body>\n'
  awk 'f{print} /^<\/style>/{f=1}' "$P"
  printf '</body>\n</html>\n'; } > public/index.html
echo "Built public/index.html"
