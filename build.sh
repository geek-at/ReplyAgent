#!/bin/bash
set -e

cd "$(dirname "$0")"

VERSION=$(grep '"version"' manifest.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
XPI_NAME="ReplyAgent-${VERSION}.xpi"

rm -f "$XPI_NAME"

zip -r "$XPI_NAME" \
  manifest.json \
  i18n.js \
  _locales/ \
  composePopup/ \
  images/ \
  mainPopup/ \
  messagePopup/ \
  utils/

echo "Built $XPI_NAME"
