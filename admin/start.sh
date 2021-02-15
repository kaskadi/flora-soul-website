#!/bin/bash
# installing and starting admin platform
kaskadi service install -n flora-soul-admin -e $PWD/index.js -r
systemctl --user restart flora-soul-admin
# starting images API
cd services/images
npm run install:prod
npm run start:prod
# starting fonts API
cd services/fonts
npm run install:prod
npm run start:prod