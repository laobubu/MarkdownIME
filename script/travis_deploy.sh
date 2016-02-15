#!/bin/sh

#Generate Document
npm install typedoc
typedoc --out dist/doc src

#Compress
cd dist
tar zcf ../dist.tgz *
cd ..

#Upload
curl -X PUT --data @dist.tgz ${UPLOAD_DIR}
