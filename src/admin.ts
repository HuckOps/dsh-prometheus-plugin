import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import { promRequest } from './client'

interface AdminSnapshotArgs {
  skip_head?: boolean
}

export function createPromqlAdminSnapshotTool(endpoint: string) {
  return defineTool({
    name: 'promql-admin-snapshot',
    description: 'Create a snapshot of the TSDB data directory (requires --web.enable-admin-api)',
    parameters: {
      skip_head: { type: 'boolean', description: 'Skip the head block (only snapshot persisted blocks).' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: AdminSnapshotArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      if (_args.skip_head !== undefined) params.set('skip_head', String(_args.skip_head))
      return promRequest(endpoint, { name: 'admin-snapshot', path: '/api/v1/admin/tsdb/snapshot', params, method: 'POST' })
    },
  })
}

interface AdminDeleteSeriesArgs {
  match: string[]
  start?: string
  end?: string
}

export function createPromqlAdminDeleteSeriesTool(endpoint: string) {
  return defineTool({
    name: 'promql-admin-delete-series',
    description: 'Delete series matching selectors in a time range (requires --web.enable-admin-api). Destructive.',
    parameters: {
      match: { type: 'array', items: { type: 'string' }, required: true, description: 'Label selectors to match series to delete.' },
      start: { type: 'string', description: 'Start timestamp (RFC3339 or Unix epoch). Defaults to minimum time.' },
      end: { type: 'string', description: 'End timestamp (RFC3339 or Unix epoch). Defaults to maximum time.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: AdminDeleteSeriesArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      for (const m of _args.match) params.append('match[]', m)
      if (_args.start) params.set('start', _args.start)
      if (_args.end) params.set('end', _args.end)
      return promRequest(endpoint, { name: 'admin-delete-series', path: '/api/v1/admin/tsdb/delete_series', params, method: 'POST' })
    },
  })
}

export function createPromqlAdminCleanTombstonesTool(endpoint: string) {
  return defineTool({
    name: 'promql-admin-clean-tombstones',
    description: 'Remove deleted data from disk and clean tombstones (requires --web.enable-admin-api). Destructive.',
    parameters: {},
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args, _exec: ToolRunContext): Promise<string> {
      return promRequest(endpoint, { name: 'admin-clean-tombstones', path: '/api/v1/admin/tsdb/clean_tombstones', method: 'POST' })
    },
  })
}
