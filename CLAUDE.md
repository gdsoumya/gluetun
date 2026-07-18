# Gluetun fork maintenance guide

This repository is a fork of [qdm12/gluetun](https://github.com/qdm12/gluetun) adding a web UI
and a few supporting control server APIs. This file documents how the fork is maintained so that
anyone (human or agent) can keep it in sync with upstream and cut releases.

When touching the backend (Go) codebase, also follow upstream's [AGENTS.md](AGENTS.md) coding
conventions. AGENTS.md belongs to upstream — never modify it in this fork.

## What this fork adds on top of upstream

- `gluetun-ui/`: a React SPA served by the control server at `/` (all non-API paths). API routes
  keep upstream paths (`/v1/...` plus legacy v0 routes) so the image is a drop-in replacement.
- `GET /v1/vpn/serverchoices`: provider server locations (filtered by active VPN type) for the
  UI server picker.
- `GET /v1/publicip/refresh`: trigger a public IP re-fetch (powers the dashboard refresh button).
- `user-stopped` / `user-running` VPN statuses: a user-initiated stop is not undone by the
  health-check auto-restart. Optional `disable_firewall` flag on `PUT /v1/vpn/status` turns off
  the kill-switch while stopped (opt-in from the UI stop confirmation).
- Dockerfile stage building the UI into `/gluetun/web`, `examples/` with a compose file and an
  auth `config.toml`, and the fork workflows described below.

The UI is served without authentication; only API routes go through the auth middleware.

## Branch model

- `upstream-master`: pure mirror of upstream master. Never commit to it.
- `master`: upstream master + the custom commits rebased on top. This branch is **force-pushed**
  by the daily sync workflow, so its history rewrites whenever upstream moves. Do not enable
  branch protection that blocks force-pushes on it.
- `vX.Y.Z-custom` (e.g. `v3.41.1-custom`): release branches, created from the upstream release
  tag `vX.Y.Z` with the custom commits cherry-picked on top. Docker images and GitHub releases
  are built from these branches only.

The "custom commit set" is always `git log $(git merge-base upstream-master master)..master`.
Keep it small and meaningful: prefer amending/squashing related changes over stacking fixup
commits, since every commit is one more rebase/cherry-pick unit.

## Workflows (.github/workflows/)

- `sync-upstream.yml` (daily 04:00 UTC, manual dispatch): fast-forwards `upstream-master`,
  rebases `master` onto the new upstream master and force-pushes it. On conflict it aborts and
  opens (or comments on) an issue labeled `upstream-sync-conflict` tagging @gdsoumya with the
  commit to check.
- `track-upstream-releases.yml` (daily 04:30 UTC, manual dispatch): if the latest upstream
  release tag `vX.Y.Z` has no `vX.Y.Z-custom` branch yet, creates it by cherry-picking the
  custom commits from `master` onto the tag, pushes it and dispatches the build workflow. On
  conflict it opens (or comments on) an issue labeled `custom-release-conflict`. Only the latest
  upstream release is handled; older versions are created manually if ever needed.
- `build-custom-release.yml` (push to `v*-custom`, manual dispatch): builds the multi-arch
  image (linux/amd64 + linux/arm64) and pushes `ghcr.io/gdsoumya/gluetun:vX.Y.Z-custom-ddmmyyyy`
  plus the moving tag `vX.Y.Z-custom`, then creates the matching GitHub release. Repeated pushes
  on the same day replace the image and recreate the release.

Note: pushes made by workflows with the default `GITHUB_TOKEN` do not trigger other workflows.
That is why the release tracker dispatches the build explicitly, and why the daily master
force-push cannot trigger builds.

## Conventions

- Open PRs into `master` and `v*-custom` branches instead of pushing directly. Direct pushes to
  a `v*-custom` branch trigger an image build and release, so batch changes through a PR and
  merge once. (Automation is the exception: the sync workflow pushes master directly.)
- Land changes on `master` first, then cherry-pick to the latest `vX.Y.Z-custom` branch via a
  PR. Only the latest released version gets custom updates.
- Commit style: Conventional Commits (`type(scope): summary`), imperative, lowercase, concise.
- Comments in code: only where the code cannot speak for itself, short and to the point.

## Resolving sync conflicts

When the `upstream-sync-conflict` issue fires:

```sh
git fetch upstream master origin master
git checkout -B master origin/master
git rebase --onto upstream/master $(git merge-base origin/master upstream/master) master
# fix conflicts, then for each: git add -A && git rebase --continue
go build ./... && go test ./internal/server/... ./internal/storage/...
npm --prefix gluetun-ui run build
git push --force-with-lease origin master
git push --force origin upstream/master:refs/heads/upstream-master
```

Keep resolutions inside the custom commits (the rebase stops at the commit that conflicts);
do not add new commits during the rebase. Known recurring conflict spots:

- `internal/server/middlewares/auth/settings.go`: upstream reshapes `validRoutes` now and then.
  Re-add the fork routes (`/v1/vpn/serverchoices`, `/v1/publicip/refresh`) in whatever format
  upstream uses.
- `internal/server/handler.go`: upstream occasionally restructures the handler wiring; keep the
  fork's root handler (API paths -> middlewares -> API, everything else -> UI without auth).
- `internal/vpn/interfaces.go`: keep upstream's `Firewall` interface members plus the fork's
  `SetEnabled`.

## Creating a release branch manually

If the tracker workflow conflicts, or for an older version:

```sh
git fetch upstream master "refs/tags/vX.Y.Z:refs/tags/vX.Y.Z"
git checkout -b vX.Y.Z-custom vX.Y.Z
git cherry-pick $(git merge-base origin/master upstream/master)..origin/master
# resolve conflicts per commit: git add -A && git cherry-pick --continue
go build ./... && npm --prefix gluetun-ui run build
git push origin vX.Y.Z-custom   # triggers the image build and GitHub release
```

Cherry-pick conflicts here usually mean the custom commits rely on newer upstream code than the
release tag has; adapt the resolution to the tag's code (e.g. older `validRoutes` format).

## Things to watch on upstream syncs

- Upstream master made the control server deny-by-default: routes with no configured role
  return 401, and the default role comes from the `HTTP_CONTROL_SERVER_AUTH_DEFAULT_ROLE` env
  variable (JSON, e.g. `{"auth":"none"}`), defaulting to no access. Released versions up to
  v3.41.x still ship an open default role. Once a deny-by-default version is released, the UI
  needs either that env variable documented everywhere or a proper login flow in the UI.
- `examples/config.toml` must keep listing every route the UI calls; when adding a UI endpoint,
  update `validRoutes`, the example config and this file.

## Local development

```sh
go build ./... && go test ./...
npm --prefix gluetun-ui install && npm --prefix gluetun-ui run build   # output in gluetun-ui/dist
docker build -t gluetun-dev .                                          # full image with UI
docker compose -f examples/docker-compose.yml up                       # example runtime setup
```
