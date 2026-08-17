import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import { promRequest } from './client'

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
    async execute(_args: InstantQueryArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({ query: _args.query })
      if (_args.time) params.set('time', _args.time)
      if (_args.timeout) params.set('timeout', _args.timeout)
      if (_args.limit) params.set('limit', String(_args.limit))
      if (_args.lookback_delta) params.set('lookback_delta', _args.lookback_delta)
      if (_args.stats) params.set('stats', _args.stats)
      return promRequest(endpoint, { name: 'query', path: '/api/v1/query', params })
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
    async execute(_args: RangeQueryArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({
        query: _args.query,
        start: _args.start,
        end: _args.end,
        step: _args.step,
      })
      if (_args.timeout) params.set('timeout', _args.timeout)
      if (_args.limit) params.set('limit', String(_args.limit))
      if (_args.lookback_delta) params.set('lookback_delta', _args.lookback_delta)
      if (_args.stats) params.set('stats', _args.stats)
      return promRequest(endpoint, { name: 'query-range', path: '/api/v1/query_range', params })
    },
  })
}

interface FormatQueryArgs {
  query: string
}

export function createPromqlFormatQueryTool(endpoint: string) {
  return defineTool({
    name: 'promql-format-query',
    description: 'Pretty-print a PromQL expression (comments removed)',
    parameters: {
      query: { type: 'string', required: true },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: FormatQueryArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({ query: _args.query })
      return promRequest(endpoint, { name: 'format-query', path: '/api/v1/format_query', params })
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
    async execute(_args: ParseQueryArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({ query: _args.query })
      return promRequest(endpoint, { name: 'parse-query', path: '/api/v1/parse_query', params })
    },
  })
}

interface ExemplarQueryArgs {
  query: string
  start: string
  end: string
}

export function createPromqlQueryExemplarsTool(endpoint: string) {
  return defineTool({
    name: 'promql-query-exemplars',
    description: 'Query exemplars for a PromQL expression over a time range (experimental)',
    parameters: {
      query: { type: 'string', required: true },
      start: { type: 'string', required: true, description: 'Start timestamp (RFC3339 or Unix epoch).' },
      end: { type: 'string', required: true, description: 'End timestamp (RFC3339 or Unix epoch).' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: ExemplarQueryArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams({ query: _args.query, start: _args.start, end: _args.end })
      return promRequest(endpoint, { name: 'query-exemplars', path: '/api/v1/query_exemplars', params })
    },
  })
}
