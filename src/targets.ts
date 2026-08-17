import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import { promRequest, createSimpleGetTool } from './client'

interface TargetsArgs {
  state?: string
  scrapePool?: string
}

export function createPromqlTargetsTool(endpoint: string) {
  return defineTool({
    name: 'promql-targets',
    description: 'List active and dropped scrape targets',
    parameters: {
      state: { type: 'string', description: 'Filter by target state: "active", "dropped", or "any" (default "any").' },
      scrapePool: { type: 'string', description: 'Filter by scrape pool name.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: TargetsArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      if (_args.state) params.set('state', _args.state)
      if (_args.scrapePool) params.set('scrapePool', _args.scrapePool)
      return promRequest(endpoint, { name: 'targets', path: '/api/v1/targets', params })
    },
  })
}

interface TargetsMetadataArgs {
  match_target?: string
  metric?: string
  limit?: number
}

export function createPromqlTargetsMetadataTool(endpoint: string) {
  return defineTool({
    name: 'promql-targets-metadata',
    description: 'Query metadata scraped directly from targets (experimental)',
    parameters: {
      match_target: { type: 'string', description: 'Label selector to filter targets, e.g. \'{job="node"}\'.' },
      metric: { type: 'string', description: 'Restrict to a single metric name.' },
      limit: { type: 'number', description: 'Maximum number of targets to return.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: TargetsMetadataArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      if (_args.match_target) params.set('match_target', _args.match_target)
      if (_args.metric) params.set('metric', _args.metric)
      if (_args.limit) params.set('limit', String(_args.limit))
      return promRequest(endpoint, { name: 'targets-metadata', path: '/api/v1/targets/metadata', params })
    },
  })
}

export const createPromqlScrapePoolsTool = createSimpleGetTool(
  'promql-scrape-pools',
  '/api/v1/scrape_pools',
  'List all configured scrape pool names',
)
