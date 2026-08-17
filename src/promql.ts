import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'


/**
 * Create a PromQL tool bound to a specific Prometheus endpoint.
 * The endpoint is captured in the closure so `execute` can reach it without
 * additional plumbing through the tool runtime.
 */
export function createPromqlQueryTool(endpoint: string) {
  return defineTool({
    name: 'promql-query',
    description: 'Query Prometheus with PromQL',
    parameters: {
      query: { type: 'string', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: any, _exec: ToolRunContext): Promise<string> {
      const response = await fetch(`${endpoint}/api/v1/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `query=${args.query}`,
      })
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
      step: { type: 'number', default: 10 }
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: any, _exec: ToolRunContext): Promise<string> {
      const response = await fetch(`${endpoint}/api/v1/query_range`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `query=${args.query}&start=${args.start}&end=${args.end}&step=${args.step}`,
      })
      const data = await response.json()
      return JSON.stringify(data)
    },
  })
}

export function createPromqlFormatQueryeTool(endpoint: string) {
  return defineTool({
    name: 'promql-format-querye',
    description: 'Format the promql exprences',
    parameters: {
      query: { type: 'string', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(args: any, _exec: ToolRunContext): Promise<string> {
      const response = await fetch(`${endpoint}/api/v1/format_query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `format_query=${args.query}`,
      })
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
