#!/bin/bash
# installing and starting admin platform
npm i
kaskadi service install -n flora-soul-admin -e $PWD/index.js -r
# starting images API
cd services/images
npm i
npm run install:prod
# starting fonts API
cd ../fonts
npm i
npm run install:prod
