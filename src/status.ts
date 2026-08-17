import { createSimpleGetTool } from './client'

export const createPromqlStatusConfigTool = createSimpleGetTool(
  'promql-status-config',
  '/api/v1/status/config',
  'Return the currently loaded YAML config',
)

export const createPromqlStatusFlagsTool = createSimpleGetTool(
  'promql-status-flags',
  '/api/v1/status/flags',
  'Return the flags Prometheus was started with',
)

export const createPromqlStatusRuntimeInfoTool = createSimpleGetTool(
  'promql-status-runtimeinfo',
  '/api/v1/status/runtimeinfo',
  'Return server runtime properties',
)

export const createPromqlStatusBuildInfoTool = createSimpleGetTool(
  'promql-status-buildinfo',
  '/api/v1/status/buildinfo',
  'Return server build information',
)

export const createPromqlStatusTsdbTool = createSimpleGetTool(
  'promql-status-tsdb',
  '/api/v1/status/tsdb',
  'Return TSDB cardinality statistics (head stats, series counts). Requires Prometheus 3.6.0+.',
  {
    limit: { type: 'number', description: 'Maximum number of label names per metric (default 10, max 10000).' },
  },
)

export const createPromqlStatusTsdbBlocksTool = createSimpleGetTool(
  'promql-status-tsdb-blocks',
  '/api/v1/status/tsdb/blocks',
  'List currently loaded TSDB blocks (experimental)',
)

export const createPromqlStatusWalReplayTool = createSimpleGetTool(
  'promql-status-walreplay',
  '/api/v1/status/walreplay',
  'Return WAL replay progress and status',
)

export const createPromqlStatusSelfMetricsTool = createSimpleGetTool(
  'promql-status-self-metrics',
  '/api/v1/status/self_metrics',
  'Return Prometheus self-monitoring metrics as ProtoJSON (experimental)',
  {
    metric_name_pattern: { type: 'string', description: 'Anchored regex to filter metric names.' },
  },
)

export const createPromqlFeaturesTool = createSimpleGetTool(
  'promql-features',
  '/api/v1/features',
  'List enabled and disabled feature flags',
)
