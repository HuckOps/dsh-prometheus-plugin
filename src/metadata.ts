import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import { promRequest } from './client'

interface SeriesArgs {
  match: string[]
  start?: string
  end?: string
  limit?: number
}

export function createPromqlSeriesTool(endpoint: string) {
  return defineTool({
    name: 'promql-series',
    description: 'List time series matching label selectors',
    parameters: {
      match: {
        type: 'array',
        items: { type: 'string' },
        required: true,
        description: 'Label matchers, e.g. ["up", \'process_start_time_seconds{job="prometheus"}\']',
      },
      start: { type: 'string', description: 'Start timestamp (RFC3339 or Unix epoch).' },
      end: { type: 'string', description: 'End timestamp (RFC3339 or Unix epoch).' },
      limit: { type: 'number', description: 'Maximum number of returned series.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: SeriesArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      for (const matcher of _args.match) {
        params.append('match[]', matcher)
      }
      if (_args.start) params.set('start', _args.start)
      if (_args.end) params.set('end', _args.end)
      if (_args.limit) params.set('limit', String(_args.limit))
      return promRequest(endpoint, { name: 'series', path: '/api/v1/series', params })
    },
  })
}

interface LabelsArgs {
  start?: string
  end?: string
  match?: string[]
  limit?: number
}

export function createPromqlLabelsTool(endpoint: string) {
  return defineTool({
    name: 'promql-labels',
    description: 'List label names in Prometheus',
    parameters: {
      start: { type: 'string', description: 'Start timestamp (RFC3339 or Unix epoch).' },
      end: { type: 'string', description: 'End timestamp (RFC3339 or Unix epoch).' },
      match: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional label selectors to scope the query.',
      },
      limit: { type: 'number', description: 'Maximum number of returned series.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: LabelsArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      if (_args.start) params.set('start', _args.start)
      if (_args.end) params.set('end', _args.end)
      if (_args.match) {
        for (const matcher of _args.match) {
          params.append('match[]', matcher)
        }
      }
      if (_args.limit) params.set('limit', String(_args.limit))
      return promRequest(endpoint, { name: 'labels', path: '/api/v1/labels', params })
    },
  })
}

interface LabelValuesArgs {
  labelName: string
  start?: string
  end?: string
  match?: string[]
  limit?: number
}

export function createPromqlLabelValuesTool(endpoint: string) {
  return defineTool({
    name: 'promql-label-values',
    description: 'List distinct values for a label name',
    parameters: {
      labelName: { type: 'string', required: true, description: 'The label name to query values for.' },
      start: { type: 'string', description: 'Start timestamp (RFC3339 or Unix epoch).' },
      end: { type: 'string', description: 'End timestamp (RFC3339 or Unix epoch).' },
      match: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional label selectors to scope the query.',
      },
      limit: { type: 'number', description: 'Maximum number of returned series.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: LabelValuesArgs, _exec: ToolRunContext): Promise<string> {
      const url = new URL(`/api/v1/label/${encodeURIComponent(_args.labelName)}/values`)
      if (_args.start) url.searchParams.set('start', _args.start)
      if (_args.end) url.searchParams.set('end', _args.end)
      if (_args.match) {
        for (const matcher of _args.match) {
          url.searchParams.append('match[]', matcher)
        }
      }
      if (_args.limit) url.searchParams.set('limit', String(_args.limit))
      return promRequest(endpoint, { name: 'label-values', path: url.pathname + url.search })
    },
  })
}

interface MetricMetadataArgs {
  metric?: string
  limit?: number
  limit_per_metric?: number
}

export function createPromqlMetadataTool(endpoint: string) {
  return defineTool({
    name: 'promql-metadata',
    description: 'Query metadata for currently scraped metrics (experimental)',
    parameters: {
      metric: { type: 'string', description: 'Restrict to a single metric name.' },
      limit: { type: 'number', description: 'Maximum number of metrics to return.' },
      limit_per_metric: { type: 'number', description: 'Maximum number of metadata entries per metric.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: MetricMetadataArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      if (_args.metric) params.set('metric', _args.metric)
      if (_args.limit) params.set('limit', String(_args.limit))
      if (_args.limit_per_metric) params.set('limit_per_metric', String(_args.limit_per_metric))
      return promRequest(endpoint, { name: 'metadata', path: '/api/v1/metadata', params })
    },
  })
}
