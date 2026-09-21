# ZCodium

<div align="center">
  <img src="public/logo/open-audit.svg" alt="ZCodium" width="96" height="96" />
  <p><strong>An independent security audit and hardening fork of ZCode</strong></p>
</div>
<p align="center">
  <a href="README.md">简体中文</a> | English ·
  <a href="https://zcode-open-audit.github.io/ZCodium/">Project site</a>
</p>

> This repository is forked from [zai-org/ZCode](https://github.com/zai-org/ZCode), open-sourced by Zhipu on September 21, 2026. The name follows the same pattern as Chrome → Chromium and VS Code → VSCodium: **ZCode → ZCodium**. Everything here is backed by code and reproducible checks.

## Download and install

The [Releases](https://github.com/Zcode-Open-Audit/ZCodium/releases) page ships desktop clients (macOS / Windows / Linux) and the CLI distribution. **Nothing is code-signed**, so the first launch is blocked by the OS — run the command below once to allow it.

### macOS (.dmg)

```bash
# after dragging the app into Applications:
sudo xattr -rd com.apple.quarantine "/Applications/ZCodium.app"
open -a "ZCodium"
```

You can also right-click the app in Finder, choose Open, and confirm Open again in the dialog.

### Windows (.exe)

```powershell
# clear the download block, then run the installer:
Unblock-File -Path "$env:USERPROFILE\Downloads\ZCode*win-x64.exe"
```

### Linux (.AppImage)

```bash
chmod +x ZCode*linux*.AppImage
./ZCode*linux*.AppImage
```

### CLI distribution (.tar.gz)

```bash
tar -xzf zcode-*.tar.gz
cd zcode
./install.sh        # installs the zcode command (defaults to ~/.zcode/runtime)
# or run it directly:
node bin/zcode.mjs --help
```

The CLI distribution needs Node.js 24.

## How it compares with upstream

| Item                     | ZCodium (this repo)                                                         | Official client (closed source)                                           | Official open source             |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | -------------------------------- |
| Monitoring and telemetry | **All removed** (~26k lines), with regression checks                                 | Everything on by default; the switches never stopped packaging or uploads | Same as the closed-source client |
| Repository upload logic  | Removed                                                                              | Present (until the 2026-09-18 report)                                     | Removed (since 2026-09-21)       |
| Historical versions      | **Full history and releases kept** for audit trail                                   | Old download links pulled                                                 | Old download links pulled        |
| Build transparency       | **GitHub Actions builds transparently from this repo**; artifacts ship with releases | Vendor binaries, not reproducible                                         | No public build                  |
| Issues and collaboration | **Open** — issues and discussions welcome                                            | Not open                                                                  | Closed                           |

## What we changed

Compared with the upstream open-source release:

- **Rebranded to ZCodium**: app name, window titles, About dialog, app icons, and the UI copy that used to say ZCode.
- **Deleted all monitoring and telemetry**, about 26k lines: ARMS RUM, OTLP reporting, crash collection, resource and network sampling, UI instrumentation. Regression checks keep those exits from coming back (see "What we removed" below).
- **Searched the sensitive paths**: snapshot packaging, encryption, and direct-upload code was reviewed across the repository; this version has no unconsented data egress.
- **Wired up builds and releases**: GitHub Actions builds the CLI distribution and deploys this site; releases run through the Release workflow with a version number.

The audit is a static code search, not full dynamic forensics. Findings and limits will be updated.

## What happens next

- Every commit in [zai-org/ZCode](https://github.com/zai-org/ZCode) gets a diff audit, not just releases.
- Only risk-free changes are synced. Code that does data egress, monitoring/telemetry, or permission expansion is stripped or rejected, with the reason recorded.
- Every sync is followed by a rebuild and a new audited release (see [Releases](https://github.com/Zcode-Open-Audit/ZCodium/releases)).
- Audit methods and conclusions stay in this repository and on the [project site](https://zcode-open-audit.github.io/ZCodium/). Review and challenge are welcome.

## Background

For the background and details, read the external coverage below; this repository makes no finding of fact about it:

| Source                                     | Link                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| ferstar's original technical analysis      | https://blog.ferstar.org/posts/zcode-silent-workspace-snapshot-upload/ |
| Independent reproduction                   | https://blog.margrop.net/post/zcode-silent-git-upload-investigation/   |
| Official open-source repository (upstream) | https://github.com/zai-org/ZCode                                       |
| The Paper coverage                         | https://www.thepaper.cn/newsDetail_forward_34111815                    |
| Jiemian News coverage                      | https://www.jiemian.com/article/15120609.html                          |
| ITHome coverage                            | https://www.ithome.com/1/005/046.htm                                   |
| Huxiu coverage                             | https://www.huxiu.com/article/4892416.html                             |
| ifeng coverage                             | https://tech.ifeng.com/c/8waIS4X7FAe                                   |

## What we removed

Compared with the upstream open-source release, this repository contains **no monitoring or telemetry implementation**:

| Area                        | Removed                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client monitoring SDK       | Alibaba Cloud ARMS RUM (`@arms/rum-electron`), its patch, initialization, route instrumentation, and renderer bridges                                   |
| Usage and network telemetry | Network metric aggregation and reporting, API event ingestion, host/scheduler forwarding, remote-session usage sampling                                 |
| Resource and performance    | Periodic resource sampling, memory diagnostics, data-size stats, TTFT export, MCP telemetry                                                             |
| Crash collection            | Crash dump reporting, OOM annotations, stability telemetry                                                                                              |
| CLI telemetry               | The entire `@zcode/telemetry` package (OTLP export, model API recording, agent metrics and traces)                                                      |
| UI instrumentation          | All session-open, subscription-error, automation, prompt-template, and user-action instrumentation, plus the platform reporting methods and IPC bridges |
| Protocol and configuration  | Telemetry event protocols and reporting paths; added filtering so legacy telemetry environment variables cannot re-enter the agent                      |

**Kept on purpose**: local logs (for troubleshooting), user-initiated feedback, and normal business requests (model calls, update checks). The device identifier is used only for business identity and local locks.

**Verification**: the change passes `pnpm typecheck`, `pnpm lint` (0 errors), and per-module regression tests. Full lists and verification limits are in the removal reports: [desktop](packages/desktop/specs/telemetry-removal-report.md), [CLI](apps/zcode-cli/specs/telemetry-removal-report.md), [UI](packages/ui/specs/telemetry-removal-report.md).

## Build and Release

- **GitHub builds**: audited code is built in this repository with GitHub Actions. CLI distributions are published to [Releases](https://github.com/Zcode-Open-Audit/ZCodium/releases), and the project site is deployed automatically with GitHub Pages. Every artifact comes from the audited source in this repository and contains no unsynced upstream changes.
- **Release flow**: run the [Release](https://github.com/Zcode-Open-Audit/ZCodium/actions/workflows/release.yml) workflow manually in Actions, enter a version (for example `3.14.0-audit.1`) to create the tag, publish the release, and build and upload the CLI distribution; check pre-release to mark it as a Pre-release.
- **Upstream sync**: review the change first, diff-audit it per version, and merge only the risk-free parts; conclusions go into the audit record.

## Disclaimer

This repository is not affiliated with Zhipu (Beijing Zhipu Huazhang Technology Co., Ltd.). All facts come from public reporting and independent code audits, with sources cited. If any party believes something is inaccurate, please open an issue.

---

# Official ZCode README (upstream content below)

> **Note**: the sections below come from the official upstream repository [zai-org/ZCode](https://github.com/zai-org/ZCode) README and describe the upstream project itself. Its community links, services, and commitments are maintained by upstream and are not part of this audit fork.

---

ZCode is an AI coding workspace with desktop, browser, and terminal interfaces. This repository contains the clients, backend services, shared UI, and Agent CLI and runtime source code.

| Interface                    | Purpose                                                                                   | Development command            |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------ |
| Desktop                      | Electron desktop application                                                              | `pnpm dev:desktop`             |
| Web / ZCode CLI distribution | Terminal and browser workspace; packages the TUI, Web client, backend, and Agent together | `pnpm dev:web`                 |
| Agent CLI                    | The `zcode` terminal interface, which also provides the Agent runtime for Desktop and Web | `pnpm --filter @zcode/cli dev` |

## Setup

Install Git, Node.js **24.14.0**, and pnpm **10.33.2**. [mise.toml](mise.toml) is the source of truth for tool versions. Run all development and packaging commands below from the repository root.

```bash
pnpm bootstrap
```

`pnpm bootstrap` installs workspace dependencies, prepares local desktop runtime assets, and runs `build:bootstrap`.

The Agent CLI and runtime source code lives in [apps/zcode-cli/](apps/zcode-cli/) as a regular directory included when you clone this repository. No separate checkout or Git submodule initialization is required.

Additional setup and build commands:

| Command                        | Purpose                                                                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                 | Install dependencies                                                                                                                |
| `pnpm prepare:desktop-runtime` | Prepare desktop runtime assets, including remote assets by default                                                                  |
| `pnpm prepare:remote-assets`   | Prepare remote runtime assets separately                                                                                            |
| `pnpm bootstrap:with-remote`   | Set up dependencies and local and remote assets, then build the relevant packages sequentially; skip the desktop application bundle |
| `pnpm build`                   | Recursively run each workspace package's build script, including its asset preparation steps                                        |

The default `bootstrap` skips remote asset preparation and is suitable for local desktop development. Run the corresponding preparation command when working with remote workspaces or validating remote distribution assets.

## Development and Usage

### Desktop

```bash
pnpm dev:desktop

# Use the test environment
pnpm dev:desktop:test
```

`pnpm dev:desktop` defaults to `pnpm dev:desktop:prod` and uses production service configuration. The startup script prepares local runtime assets, builds the desktop Agent, then starts Electron and source watchers.

Set `ZCODE_DATA_BASE_DIR` to use a separate development data directory. For example, on macOS / Linux:

```bash
ZCODE_DATA_BASE_DIR="$HOME/.zcode-dev-home" pnpm dev:desktop:test
```

### Web Development

Use development mode when editing Web or backend source code:

```bash
pnpm dev:web

# Set the backend workspace (macOS / Linux)
ZCODE_SERVER_WORKSPACE=/path/to/project pnpm dev:web
```

This starts both the Web development server (default: `http://localhost:5173`) and the backend (default: `http://localhost:3030`). Open the Web development server in your browser. `/ws` and general `/api` requests are proxied to the local backend; `/api/v1/oauth/token` is proxied separately to the configured product service.

After changing Agent source code, run `pnpm --filter @zcode/cli... build` and restart the service. To validate the complete distribution, extract and run it as described under Packaging → ZCode CLI distribution below.

### ZCode CLI distribution

The command-line distribution includes the TUI, Web client, and Agent behind one `zcode` command. With no arguments it starts the TUI; a leading `--web` starts Web mode; all other arguments go to the existing Agent CLI. Both modes run locally without Electron.

```bash
# Start the terminal UI by default
zcode

# Start the Web interface
zcode --web

# Set the project and port without opening a browser automatically
zcode --web --workspace /path/to/project --port 3030 --no-open

# Show CLI or Web options
zcode --help
zcode --web --help
```

In Web mode, it uses the current directory as the workspace, listens on `127.0.0.1` without token authentication by default, selects an available port, and opens a browser. Use the URL printed in the terminal and press `Ctrl+C` to stop the service. For LAN access, use `--host 0.0.0.0`; listening on a non-local address generates an access token by default. Use the token-bearing URL printed in the terminal. Set a token with `--token`, or disable token authentication with `--no-token`.

When starting the general Web service's HTTP entry directly, configure API/WebSocket authentication with `ZCODE_SERVER_AUTH_TOKEN`. When creating the service programmatically, use the `authToken` option.

See Packaging below for build instructions. `pnpm build:zcode` only creates the distribution; it does not replace an existing `zcode` on `PATH`. If the command still points to an older installation or another checkout, check it with `command -v zcode` on macOS / Linux or `where.exe zcode` on Windows.

### CLI Source Development

Use the source entry when developing the TUI or Agent:

```bash
pnpm --filter @zcode/cli dev --help
pnpm --filter @zcode/cli dev

# Build the CLI and its workspace dependencies
pnpm --filter @zcode/cli... build
node apps/zcode-cli/packages/cli/dist/zcode.cjs --help
```

This entry runs the Agent CLI directly and does not handle the distribution's `--web` switch. Use `pnpm dev:web` for Web development, or the extracted `bin/zcode.mjs` shown below to test the unified command.

## Configuration

The root [.env.example](.env.example) provides sample service URLs and build configuration. Copy it to `.env` as needed and place local overrides in `.env.local`. Select the Desktop development environment with `dev:desktop:test` or `dev:desktop:prod`.

| Setting                              | Purpose                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| `ZCODE_DATA_BASE_DIR`                | Base directory for application data, stored under its `.zcode/` subdirectory            |
| `ZCODE_SERVER_WORKSPACE`             | Workspace path for the Web backend                                                      |
| `ZCODE_BUILTIN_PROVIDER_CONFIG_FILE` | Path to a local provider configuration file; uses the built-in configuration when unset |
| `ZCODE_DIST_BASE_URL`                | Download base URL used by the CLI distribution installer                                |

Runtime variables can be set explicitly in the environment of the startup command. See [config/README.md](config/README.md) for the default configuration shipped with the client.

## Packaging

See [third-party/README.md](third-party/README.md) for notice generation, distribution checks, and where the notices are included in each distribution.

### Desktop

```bash
pnpm bundle:desktop

# Set the target platform and CPU architecture
pnpm bundle:desktop -- --os win --arch x64

pnpm bundle:desktop -- --help
```

The default target is macOS arm64, and the default output directory is `packages/desktop/dist/`. `--os` accepts `mac`, `win`, or `linux`; `--arch` accepts `x64` or `arm64`. Packaging and signing require the tools and configuration for the target platform.

### ZCode CLI distribution

Run `pnpm build:zcode` to build the CLI/TUI, backend, and Web client, collect the TUI native libraries, workers, and runtime dependencies, then assemble the distribution. Running the distribution still requires Node.js; use the version specified in `mise.toml`.

Before packaging, set the download base URL with `ZCODE_DIST_BASE_URL` in `.env`, `.env.local`, or the process environment, or pass it through `--base-url`. The URL below is a placeholder; replace it with your hosting URL when publishing:

```bash
pnpm build:zcode --base-url https://downloads.example.com/zcode/

# When ZCODE_DIST_BASE_URL is already configured
pnpm build:zcode

# Repackage existing Agent, backend, and Web build outputs
pnpm build:zcode --skip-build

# Show options for the version, output directory, and more
pnpm build:zcode --help
```

The version defaults to the root `package.json` version. Output is written to `dist/zcode/`:

- `releases/<version>/zcode-<version>.tar.gz`: runtime package.
- `releases/<version>/sha256.txt`: checksum file.
- `latest.json` and `install.sh`: version index and installer.

Upload the entire directory to the configured download base URL. The installer downloads the runtime package from that URL, installs it to `~/.zcode/runtime` by default, and creates the `zcode` command in `~/.local/bin`. Override these directories with `ZCODE_DIST_HOME` and `ZCODE_DIST_BIN_DIR`, respectively.

Existing Lite users should switch to the new build command, environment variables, and installer. Installation does not remove old Lite directories or migrate/delete session data.

To test a packaged build locally, extract and run it directly without uploading or installing it:

```bash
zcode_version=$(node -p "require('./dist/zcode/latest.json').version")
mkdir -p dist/zcode/debug
tar -xzf "dist/zcode/releases/$zcode_version/zcode-$zcode_version.tar.gz" \
  -C dist/zcode/debug
# Start the TUI by default
node dist/zcode/debug/zcode/bin/zcode.mjs

# Start Web mode
node dist/zcode/debug/zcode/bin/zcode.mjs --web \
  --workspace "$PWD" --port 3030 --no-open
```

Open `http://127.0.0.1:3030` to validate the complete flow, with one backend serving the Web pages and running the Agent. The port must be available; if `pnpm dev:web` is already running, choose another `--port`.

## Repository Structure

| Directory                                            | Responsibility                                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `packages/desktop`                                   | Electron Main, Host, Renderer, and desktop packaging                                    |
| `packages/web`                                       | Web client                                                                              |
| `packages/server`                                    | HTTP / WebSocket services and remote connections                                        |
| `packages/zcode-server-cli`                          | Standalone server startup and process management                                        |
| `packages/ui`                                        | Shared React components, hooks, and Zustand state                                       |
| `packages/services`                                  | Business services and persistence                                                       |
| `packages/shared`, `packages/rpc`, `packages/client` | Shared protocols and types, RPC framework, and Agent client SDK                         |
| `packages/provider`, `packages/provider-node`        | Common provider capabilities and Node implementations                                   |
| `apps/zcode-cli`                                     | Agent CLI, TUI, runtime, and tools                                                      |
| `site`                                               | Audit project site (Vite + Svelte + Tailwind CSS), deployed with GitHub Pages           |
| `scripts`, `config`, `third-party`                   | Build and maintenance scripts, built-in configuration, and third-party notice materials |

The project site source lives in [site/](site/), built with Vite + Svelte + Tailwind CSS v4. Build output goes to `docs/` and is served by GitHub Pages. To publish an update, run `pnpm --dir site build` and commit the output under `docs/`.

## Project Notice

See [NOTICE.md](NOTICE.md) for feature and promotion scope, maintenance policy, execution and data risks, licensing, and third-party copyright information.
