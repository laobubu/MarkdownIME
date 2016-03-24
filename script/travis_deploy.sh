#!/bin/sh

#Recompile. dont know why.
npm install --no-optional
make

#Generate Document
npm install typedoc
typedoc --out dist/doc src

#Compress
tar zcf dist.tgz -C dist .

#Upload
echo "start upload file"
curl -X PUT -F "file=@dist.tgz" ${UPLOAD_DIR}

#Remove generated files
rm dist.tgz
rm -rf node_modules dist
