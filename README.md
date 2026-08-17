# dsh-prometheus-plugin

A [DeepSeek Harness (`dsh`)](https://github.com/deepseek-ai) plugin that exposes the
Prometheus HTTP API as a set of tools an LLM agent can call. Built on the
[Cordis](https://github.com/cordiverse/cordis) framework and
`@deepseek-ai/dsh-tools`.

## Features

- **30 tools** covering the full Prometheus HTTP API: instant / range queries,
  metadata & series discovery, targets, rules / alerts / alertmanagers, server
  status, the experimental Search API, and the admin TSDB endpoints.
- A single shared HTTP client (`src/client.ts`) with consistent error formatting
  and a configurable request timeout (`AbortController`, default 30s).
- Declarative tool definitions via `@deepseek-ai/dsh-tools`, friendly for agent use.

## Prerequisites

- A running Prometheus instance reachable over HTTP.
- Some endpoints require extra Prometheus launch flags:
  - **Admin tools** (`admin-snapshot`, `admin-delete-series`, `admin-clean-tombstones`)
    require `--web.enable-admin-api`.
  - **Search tools** (`search-metric-names`, `search-label-names`, `search-label-values`)
    require `--enable-feature=search-api`.
  - Some endpoints are only available in newer Prometheus versions
    (`format-query`, `parse-query`, `query-exemplars`, `status-tsdb` (3.6.0+),
    `status-self-metrics`, `features`, …). Pointing a tool at an older server
    returns an HTTP error from Prometheus itself.

## Usage

The plugin is loaded directly by `dsh` from its TypeScript source — no build
step is required for local use. Add the following to your `dsh` `cordis.yml`
(adjust the `name` path to where you cloned the repo):

```yaml
- insert:
    - id: promql-plugin
      name: '/path/to/dsh-prometheus-plugin/src/plugin.ts'
      config:
        prometheusEndpoint: http://127.0.0.1:9090
```

`prometheusEndpoint` defaults to `http://127.0.0.1:9090` when omitted.

To type-check / build the sources (e.g. before contributing):

```bash
npm install
npm run build   # runs tsc, output to lib/
```

> Note: `package.json` declares `main` as `lib/index.js`, but the package has no
> `src/index.ts`. For `dsh` usage the entry is loaded directly via `cordis.yml`
> (above), so a build is not required. If you intend to publish to npm, add an
> `src/index.ts` that re-exports `apply` from `./plugin`.

## Tools

All tools are registered with the `promql-` prefix.

### Query

| Tool | Prometheus endpoint |
|------|---------------------|
| `promql-query` | `GET /api/v1/query` |
| `promql-query-range` | `GET /api/v1/query_range` |
| `promql-format-query` | `GET /api/v1/format_query` |
| `promql-parse-query` | `GET /api/v1/parse_query` |
| `promql-query-exemplars` | `GET /api/v1/query_exemplars` |

### Metadata & series

| Tool | Prometheus endpoint |
|------|---------------------|
| `promql-series` | `GET /api/v1/series` |
| `promql-labels` | `GET /api/v1/labels` |
| `promql-label-values` | `GET /api/v1/label/{name}/values` |
| `promql-metadata` | `GET /api/v1/metadata` |

### Targets

| Tool | Prometheus endpoint |
|------|---------------------|
| `promql-targets` | `GET /api/v1/targets` |
| `promql-targets-metadata` | `GET /api/v1/targets/metadata` |
| `promql-scrape-pools` | `GET /api/v1/scrape_pools` |

### Rules / alerts / alertmanagers

| Tool | Prometheus endpoint |
|------|---------------------|
| `promql-rules` | `GET /api/v1/rules` |
| `promql-alerts` | `GET /api/v1/alerts` |
| `promql-alertmanagers` | `GET /api/v1/alertmanagers` |

### Status

| Tool | Prometheus endpoint |
|------|---------------------|
| `promql-status-config` | `GET /api/v1/status/config` |
| `promql-status-flags` | `GET /api/v1/status/flags` |
| `promql-status-runtimeinfo` | `GET /api/v1/status/runtimeinfo` |
| `promql-status-buildinfo` | `GET /api/v1/status/buildinfo` |
| `promql-status-tsdb` | `GET /api/v1/status/tsdb` (3.6.0+) |
| `promql-status-tsdb-blocks` | `GET /api/v1/status/tsdb/blocks` |
| `promql-status-walreplay` | `GET /api/v1/status/walreplay` |
| `promql-status-self-metrics` | `GET /api/v1/status/self_metrics` |
| `promql-features` | `GET /api/v1/features` |

### Search (experimental, requires `--enable-feature=search-api`)

| Tool | Prometheus endpoint |
|------|---------------------|
| `promql-search-metric-names` | `GET /api/v1/search/metric_names` |
| `promql-search-label-names` | `GET /api/v1/search/label_names` |
| `promql-search-label-values` | `GET /api/v1/search/label_values` |

### Admin (requires `--web.enable-admin-api`)

| Tool | Prometheus endpoint |
|------|---------------------|
| `promql-admin-snapshot` | `POST /api/v1/admin/tsdb/snapshot` |
| `promql-admin-delete-series` | `POST /api/v1/admin/tsdb/delete_series` |
| `promql-admin-clean-tombstones` | `POST /api/v1/admin/tsdb/clean_tombstones` |

## Project layout

```
.
├── cordis.yml          # dsh plugin registration (local dev path)
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── src/
    ├── client.ts       # shared HTTP client + error handling + timeout
    ├── query.ts        # query / query_range / format_query / parse_query / query_exemplars
    ├── metadata.ts     # series / labels / label_values / metadata
    ├── targets.ts      # targets / targets_metadata / scrape_pools
    ├── rules.ts        # rules / alerts / alertmanagers
    ├── status.ts       # config / flags / runtimeinfo / buildinfo / tsdb / tsdb_blocks / walreplay / self_metrics / features
    ├── search.ts       # search/metric_names / search/label_names / search/label_values
    ├── admin.ts        # admin/tsdb/snapshot / delete_series / clean_tombstones
    └── plugin.ts       # entry: imports and registers all tools
```

## License

[MIT](./LICENSE) © 2026 HuckOps
