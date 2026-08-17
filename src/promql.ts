import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'

interface QueryArgs { query: string }
interface RangeArgs { query: string; start: number; end: number; step?: number }
interface FormatArgs { query: string }

/**
 * Create a PromQL tool bound to a specific Prometheus endpoint.
 * The endpoint is captured in the closure so `execute` can reach it without
 * additional plumbing through the tool runtime.
 */
export function createPromqlQueryTool(endpoint: string) {
  return defineTool({
    name: 'promql-query',
    description: 'Query Prometheus with PromQL (instant query)',
    parameters: {
      query: { type: 'string', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: QueryArgs, _exec: ToolRunContext): Promise<string> {
      const response = await fetch(`${endpoint}/api/v1/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `query=${encodeURIComponent(args.query)}`,
      })
      if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`promql-query: HTTP ${response.status} — ${body.slice(0, 200)}`)
      }
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
}

export function createPromqlQueryRangeTool(endpoint: string) {
  return defineTool({
    name: 'promql-query-range',
    description: 'Query Prometheus with PromQL range query',
    parameters: {
      query: { type: 'string', required: true },
      start: { type: 'number', required: true },
      end: { type: 'number', required: true },
      step: { type: 'number', default: 15 },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: RangeArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({
        query: args.query,
        start: String(args.start),
        end: String(args.end),
        step: String(args.step ?? 15),
      })
      const response = await fetch(`${endpoint}/api/v1/query_range?${params.toString()}`)
      if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`promql-query-range: HTTP ${response.status} — ${body.slice(0, 200)}`)
      }
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
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
    async execute(args: FormatArgs, _exec: ToolRunContext): Promise<string> {
      const response = await fetch(`${endpoint}/api/v1/format_query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `format_query=${encodeURIComponent(args.query)}`,
      })
      if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`promql-format-query: HTTP ${response.status} — ${body.slice(0, 200)}`)
      }
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
}

export function createPromqlSeriesTool(endpoint: string) {
  return defineTool({
    name: 'promql-series',
    description: 'List series matching Prometheus label selectors',
    parameters: {
      match: {
        type: 'array',
        items: { type: 'string' },
        required: true,
        description: 'Label matchers (e.g. "up", "process_start_time_seconds{job=\\"prometheus\\"}")',
      },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: { match: string[] }, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      for (const matcher of args.match) {
        params.append('match[]', matcher)
      }
      const response = await fetch(`${endpoint}/api/v1/series?${params.toString()}`)
      if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`promql-series: HTTP ${response.status} — ${body.slice(0, 200)}`)
      }
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
}
