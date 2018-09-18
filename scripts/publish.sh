#!/bin/bash
cd $(dirname $0)/..

yarn version || exit 1  # Input new version
VERSION=$(grep -Po '(?<=version": ")([^"]+)' package.json)

[ -d dist ] && rm -rf dist
yarn prepare || exit 2

echo ">> Publish to NPM"; (
  cd dist
  yarn publish
)

echo ">> Upload to laobubu.build"; {
  rm -rf laobubu.build
  git clone git@github.com:laobubu/laobubu.build.git laobubu.build -b gh-pages
  rm -rf laobubu.build/MarkdownIME
  cp -R dist laobubu.build/MarkdownIME
  cd laobubu.build
  git add -A
  git commit -m "Update MarkdownIME to v$VERSION"
  git push
  cd ..
  rm -rf laobubu.build
}

echo ">> Commit to Git"; (
  git commit -am "Author version $VERSION"
  git tag -f "v$VERSION"
  git push --follow-tags
)
