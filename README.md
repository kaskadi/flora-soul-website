[![Sync status](https://img.shields.io/github/workflow/status/kaskadi/template-synced-repo/sync?label=sync&logo=github)](https://github.com/kaskadi/template-synced-repo/actions?query=workflow%3Async)

****

# Remote synchronization configuration

This repository is automatically synchronized with a remote server running a synchronization API (see [here](https://github.com/kaskadi/remote-sync-api)) using the action [action-remote-sync](https://github.com/kaskadi/action-remote-sync) in its [sync](./.github/workflows/sync.yml) workflow.

By default, this repository will synchronize to `kaskadi`'s default server. If you wish to update this, please provide in your [repository secrets](https://github.com/kaskadi/template-synced-repo/settings/secrets/actions) the two following secrets:
- `SYNC_API_ROOT`: Root of the API running on the server to synchronize this repository with. The server **needs** to have a sync API running on it in order to perform the synchronization operation. The root should follow the format: `http(s)://{DOMAIN}/{API_ROOT}`.
- `SYNC_API_AUTH_TOKEN`: token used for authorization purpose by the sync API.