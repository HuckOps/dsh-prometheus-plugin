import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import { promRequest } from './client'

interface SearchArgs {
  match?: string[]
  search?: string[]
  fuzz_threshold?: number
  fuzz_alg?: string
  case_sensitive?: boolean
  sort_by?: string
  sort_dir?: string
  include_score?: boolean
  start?: string
  end?: string
  limit?: number
  batch_size?: number
  label?: string
}

function buildSearchParams(args: SearchArgs): URLSearchParams {
  const params = new URLSearchParams()
  if (args.match) for (const v of args.match) params.append('match[]', v)
  if (args.search) for (const v of args.search) params.append('search[]', v)
  if (args.fuzz_threshold !== undefined) params.set('fuzz_threshold', String(args.fuzz_threshold))
  if (args.fuzz_alg) params.set('fuzz_alg', args.fuzz_alg)
  if (args.case_sensitive !== undefined) params.set('case_sensitive', String(args.case_sensitive))
  if (args.sort_by) params.set('sort_by', args.sort_by)
  if (args.sort_dir) params.set('sort_dir', args.sort_dir)
  if (args.include_score !== undefined) params.set('include_score', String(args.include_score))
  if (args.start) params.set('start', args.start)
  if (args.end) params.set('end', args.end)
  if (args.limit) params.set('limit', String(args.limit))
  if (args.batch_size) params.set('batch_size', String(args.batch_size))
  if (args.label) params.set('label', args.label)
  return params
}

function makeSearchTool(name: string, path: string, description: string, withLabel: boolean) {
  return (endpoint: string) => defineTool({
    name,
    description,
    parameters: withLabel
      ? {
          match: { type: 'array', items: { type: 'string' }, description: 'Optional label selectors to scope the search.' },
          search: { type: 'array', items: { type: 'string' }, description: 'Substring(s) to search for.' },
          fuzz_threshold: { type: 'number', description: 'Fuzzy match threshold between 0 and 1.' },
          fuzz_alg: { type: 'string', description: 'Fuzzy algorithm: "subsequence" or "jarowinkler".' },
          case_sensitive: { type: 'boolean', description: 'Case-sensitive matching.' },
          sort_by: { type: 'string', description: 'Sort field, e.g. "alpha" or "score".' },
          sort_dir: { type: 'string', description: 'Sort direction: "asc" or "dsc".' },
          include_score: { type: 'boolean', description: 'Include match score in results.' },
          start: { type: 'string', description: 'Start timestamp (RFC3339 or Unix epoch).' },
          end: { type: 'string', description: 'End timestamp (RFC3339 or Unix epoch).' },
          limit: { type: 'number', description: 'Maximum number of results (default 100).' },
          batch_size: { type: 'number', description: 'Internal batch size (default 100).' },
          label: { type: 'string', required: true, description: 'The label name to search values for.' },
        }
      : {
          match: { type: 'array', items: { type: 'string' }, description: 'Optional label selectors to scope the search.' },
          search: { type: 'array', items: { type: 'string' }, description: 'Substring(s) to search for.' },
          fuzz_threshold: { type: 'number', description: 'Fuzzy match threshold between 0 and 1.' },
          fuzz_alg: { type: 'string', description: 'Fuzzy algorithm: "subsequence" or "jarowinkler".' },
          case_sensitive: { type: 'boolean', description: 'Case-sensitive matching.' },
          sort_by: { type: 'string', description: 'Sort field, e.g. "alpha" or "score".' },
          sort_dir: { type: 'string', description: 'Sort direction: "asc" or "dsc".' },
          include_score: { type: 'boolean', description: 'Include match score in results.' },
          start: { type: 'string', description: 'Start timestamp (RFC3339 or Unix epoch).' },
          end: { type: 'string', description: 'End timestamp (RFC3339 or Unix epoch).' },
          limit: { type: 'number', description: 'Maximum number of results (default 100).' },
          batch_size: { type: 'number', description: 'Internal batch size (default 100).' },
        },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: SearchArgs, _exec: ToolRunContext): Promise<string> {
      return promRequest(endpoint, { name: name.replace(/^promql-/, ''), path, params: buildSearchParams(_args) })
    },
  })
}

export const createPromqlSearchMetricNamesTool = makeSearchTool(
  'promql-search-metric-names',
  '/api/v1/search/metric_names',
  'Discover metric names via the experimental search API (requires --enable-feature=search-api)',
  false,
)

export const createPromqlSearchLabelNamesTool = makeSearchTool(
  'promql-search-label-names',
  '/api/v1/search/label_names',
  'Discover label names via the experimental search API (requires --enable-feature=search-api)',
  false,
)

export const createPromqlSearchLabelValuesTool = makeSearchTool(
  'promql-search-label-values',
  '/api/v1/search/label_values',
  'Discover label values via the experimental search API (requires --enable-feature=search-api)',
  true,
)
