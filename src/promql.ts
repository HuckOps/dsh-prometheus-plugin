import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'

function errPrefix(name: string) {
  return `promql-${name}:`
}

interface InstantQueryArgs {
  query: string
  time?: string
  timeout?: string
  limit?: number
  lookback_delta?: string
  stats?: string
}

export function createPromqlQueryTool(endpoint: string) {
  return defineTool({
    name: 'promql-query',
    description: 'Evaluate an instant PromQL expression',
    parameters: {
      query: { type: 'string', required: true },
      time: { type: 'string', description: 'Evaluation timestamp in RFC3339 or Unix epoch. Defaults to server time.' },
      timeout: { type: 'string', description: 'Evaluation timeout, e.g. "10s".' },
      limit: { type: 'number', description: 'Maximum number of returned series.' },
      lookback_delta: { type: 'string', description: 'Override lookback period, e.g. "5m".' },
      stats: { type: 'string', description: 'Include query statistics ("all" for detailed timings).' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: InstantQueryArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({ query: args.query })
      if (args.time) params.set('time', args.time)
      if (args.timeout) params.set('timeout', args.timeout)
      if (args.limit) params.set('limit', String(args.limit))
      if (args.lookback_delta) params.set('lookback_delta', args.lookback_delta)
      if (args.stats) params.set('stats', args.stats)
      const response = await fetch(`${endpoint}/api/v1/query?${params.toString()}`)
      if (!response.ok) throw new Error(`${errPrefix('query')} HTTP ${response.status} — ${await response.text().catch(() => '')}`)
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
}

interface RangeQueryArgs {
  query: string
  start: string
  end: string
  step: string
  timeout?: string
  limit?: number
  lookback_delta?: string
  stats?: string
}

export function createPromqlQueryRangeTool(endpoint: string) {
  return defineTool({
    name: 'promql-query-range',
    description: 'Evaluate a PromQL expression over a time range',
    parameters: {
      query: { type: 'string', required: true },
      start: { type: 'string', required: true, description: 'Start timestamp (RFC3339 or Unix epoch)' },
      end: { type: 'string', required: true, description: 'End timestamp (RFC3339 or Unix epoch)' },
      step: { type: 'string', required: true, description: 'Step width, e.g. "15s" or "1m"' },
      timeout: { type: 'string', description: 'Evaluation timeout.' },
      limit: { type: 'number', description: 'Maximum number of returned series.' },
      lookback_delta: { type: 'string', description: 'Override lookback period.' },
      stats: { type: 'string', description: 'Include query statistics ("all" for detailed timings).' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: RangeQueryArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({
        query: args.query,
        start: args.start,
        end: args.end,
        step: args.step,
      })
      if (args.timeout) params.set('timeout', args.timeout)
      if (args.limit) params.set('limit', String(args.limit))
      if (args.lookback_delta) params.set('lookback_delta', args.lookback_delta)
      if (args.stats) params.set('stats', args.stats)
      const response = await fetch(`${endpoint}/api/v1/query_range?${params.toString()}`)
      if (!response.ok) throw new Error(`${errPrefix('query-range')} HTTP ${response.status} — ${await response.text().catch(() => '')}`)
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
}

interface FormatQueryArgs {
  query: string
}

export function createPromqlFormatQueryTool(endpoint: string) {
  return defineTool({
    name: 'promql-format-query',
    description: 'Pretty-print a PromQL expression',
    parameters: {
      query: { type: 'string', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: FormatQueryArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({ query: args.query })
      const response = await fetch(`${endpoint}/api/v1/format_query?${params.toString()}`)
      if (!response.ok) throw new Error(`${errPrefix('format-query')} HTTP ${response.status} — ${await response.text().catch(() => '')}`)
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
}

interface ParseQueryArgs {
  query: string
}

export function createPromqlParseQueryTool(endpoint: string) {
  return defineTool({
    name: 'promql-parse-query',
    description: 'Parse a PromQL expression into its AST (experimental)',
    parameters: {
      query: { type: 'string', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: ParseQueryArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({ query: args.query })
      const response = await fetch(`${endpoint}/api/v1/parse_query?${params.toString()}`)
      if (!response.ok) throw new Error(`${errPrefix('parse-query')} HTTP ${response.status} — ${await response.text().catch(() => '')}`)
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
}

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
    async execute(args: SeriesArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      for (const matcher of args.match) {
        params.append('match[]', matcher)
      }
      if (args.start) params.set('start', args.start)
      if (args.end) params.set('end', args.end)
      if (args.limit) params.set('limit', String(args.limit))
      const response = await fetch(`${endpoint}/api/v1/series?${params.toString()}`)
      if (!response.ok) throw new Error(`${errPrefix('series')} HTTP ${response.status} — ${await response.text().catch(() => '')}`)
      const data = await response.json()
      return JSON.stringify(data)
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
    async execute(args: LabelsArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      if (args.start) params.set('start', args.start)
      if (args.end) params.set('end', args.end)
      if (args.match) {
        for (const matcher of args.match) {
          params.append('match[]', matcher)
        }
      }
      if (args.limit) params.set('limit', String(args.limit))
      const response = await fetch(`${endpoint}/api/v1/labels?${params.toString()}`)
      if (!response.ok) throw new Error(`${errPrefix('labels')} HTTP ${response.status} — ${await response.text().catch(() => '')}`)
      const data = await response.json()
      return JSON.stringify(data)
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
    async execute(args: LabelValuesArgs, _exec: ToolRunContext): Promise<string> {
      const url = new URL(`${endpoint}/api/v1/label/${encodeURIComponent(args.labelName)}/values`)
      if (args.start) url.searchParams.set('start', args.start)
      if (args.end) url.searchParams.set('end', args.end)
      if (args.match) {
        for (const matcher of args.match) {
          url.searchParams.append('match[]', matcher)
        }
      }
      if (args.limit) url.searchParams.set('limit', String(args.limit))
      const response = await fetch(url.toString())
      if (!response.ok) throw new Error(`${errPrefix('label-values')} HTTP ${response.status} — ${await response.text().catch(() => '')}`)
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
}
