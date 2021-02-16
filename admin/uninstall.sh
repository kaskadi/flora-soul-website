#!/bin/bash
# uninstalling main service
kaskadi service uninstall -n flora-soul-admin
# uninstalling images API
cd services/images
npm run uninstall:prod
# uninstalling fonts API
cd services/fonts
npm run uninstall:prod