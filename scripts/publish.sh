#!/bin/bash
cd $(dirname $0)/..

OLD_VERSION=$(grep -Po '(?<=version": ")([^"]+)' package.json)
echo -ne "Old version is $OLD_VERSION\nInput new: "
read VERSION
yarn version --new-version $VERSION || exit 1  # Input new version

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
