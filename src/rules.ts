import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import { promRequest, createSimpleGetTool } from './client'

interface RulesArgs {
  type?: string
  rule_name?: string[]
  rule_group?: string[]
  file?: string[]
  exclude_alerts?: boolean
  match?: string[]
  group_limit?: number
  group_next_token?: string
}

export function createPromqlRulesTool(endpoint: string) {
  return defineTool({
    name: 'promql-rules',
    description: 'List loaded alerting and recording rules plus active alerts',
    parameters: {
      type: { type: 'string', description: 'Filter by rule type: "alert" or "record".' },
      rule_name: { type: 'array', items: { type: 'string' }, description: 'Filter by rule names.' },
      rule_group: { type: 'array', items: { type: 'string' }, description: 'Filter by rule group names.' },
      file: { type: 'array', items: { type: 'string' }, description: 'Filter by rule file paths.' },
      exclude_alerts: { type: 'boolean', description: 'Exclude active alerts from the response.' },
      match: { type: 'array', items: { type: 'string' }, description: 'Label selectors to filter rules by.' },
      group_limit: { type: 'number', description: 'Maximum number of rule groups per page.' },
      group_next_token: { type: 'string', description: 'Pagination token for the next page of groups.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: RulesArgs, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      if (_args.type) params.set('type', _args.type)
      if (_args.rule_name) for (const v of _args.rule_name) params.append('rule_name[]', v)
      if (_args.rule_group) for (const v of _args.rule_group) params.append('rule_group[]', v)
      if (_args.file) for (const v of _args.file) params.append('file[]', v)
      if (_args.exclude_alerts !== undefined) params.set('exclude_alerts', String(_args.exclude_alerts))
      if (_args.match) for (const v of _args.match) params.append('match[]', v)
      if (_args.group_limit) params.set('group_limit', String(_args.group_limit))
      if (_args.group_next_token) params.set('group_next_token', _args.group_next_token)
      return promRequest(endpoint, { name: 'rules', path: '/api/v1/rules', params })
    },
  })
}

export const createPromqlAlertsTool = createSimpleGetTool(
  'promql-alerts',
  '/api/v1/alerts',
  'List all active alerts',
)

export const createPromqlAlertmanagersTool = createSimpleGetTool(
  'promql-alertmanagers',
  '/api/v1/alertmanagers',
  'List active and dropped Alertmanager discovery instances',
)
