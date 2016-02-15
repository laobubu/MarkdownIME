#!/bin/sh

#Generate Document
npm install typedoc
typedoc --out dist/doc src

#Compress
cd dist
tar zcf ../dist.tgz *
cd ..

#Upload
echo "start upload file"
curl -X PUT -F "file=@dist.tgz" ${UPLOAD_DIR}
rm dist.tgz
