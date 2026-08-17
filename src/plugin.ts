import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import {
  createPromqlAdminCleanTombstonesTool,
  createPromqlAdminDeleteSeriesTool,
  createPromqlAdminSnapshotTool,
} from './admin'
import {
  createPromqlLabelValuesTool,
  createPromqlLabelsTool,
  createPromqlMetadataTool,
  createPromqlSeriesTool,
} from './metadata'
import {
  createPromqlFormatQueryTool,
  createPromqlParseQueryTool,
  createPromqlQueryExemplarsTool,
  createPromqlQueryRangeTool,
  createPromqlQueryTool,
} from './query'
import {
  createPromqlAlertmanagersTool,
  createPromqlAlertsTool,
  createPromqlRulesTool,
} from './rules'
import {
  createPromqlSearchLabelNamesTool,
  createPromqlSearchLabelValuesTool,
  createPromqlSearchMetricNamesTool,
} from './search'
import {
  createPromqlFeaturesTool,
  createPromqlStatusBuildInfoTool,
  createPromqlStatusConfigTool,
  createPromqlStatusFlagsTool,
  createPromqlStatusRuntimeInfoTool,
  createPromqlStatusSelfMetricsTool,
  createPromqlStatusTsdbBlocksTool,
  createPromqlStatusTsdbTool,
  createPromqlStatusWalReplayTool,
} from './status'
import {
  createPromqlScrapePoolsTool,
  createPromqlTargetsMetadataTool,
  createPromqlTargetsTool,
} from './targets'

export const name = 'dsh-prometheus-plugin'
export const inject = ['tools']

export interface Config {
  prometheusEndpoint: string
}

export const Config: Schema<Config> = Schema.object({
  prometheusEndpoint: Schema.string().default('http://127.0.0.1:9090'),
})

export function apply(ctx: Context, config: Config) {
  const endpoint = config.prometheusEndpoint

  // Query
  ctx.tools.register(createPromqlQueryTool(endpoint))
  ctx.tools.register(createPromqlQueryRangeTool(endpoint))
  ctx.tools.register(createPromqlFormatQueryTool(endpoint))
  ctx.tools.register(createPromqlParseQueryTool(endpoint))
  ctx.tools.register(createPromqlQueryExemplarsTool(endpoint))

  // Metadata & series
  ctx.tools.register(createPromqlSeriesTool(endpoint))
  ctx.tools.register(createPromqlLabelsTool(endpoint))
  ctx.tools.register(createPromqlLabelValuesTool(endpoint))
  ctx.tools.register(createPromqlMetadataTool(endpoint))

  // Targets
  ctx.tools.register(createPromqlTargetsTool(endpoint))
  ctx.tools.register(createPromqlTargetsMetadataTool(endpoint))
  ctx.tools.register(createPromqlScrapePoolsTool(endpoint))

  // Rules / alerts / alertmanagers
  ctx.tools.register(createPromqlRulesTool(endpoint))
  ctx.tools.register(createPromqlAlertsTool(endpoint))
  ctx.tools.register(createPromqlAlertmanagersTool(endpoint))

  // Status
  ctx.tools.register(createPromqlStatusConfigTool(endpoint))
  ctx.tools.register(createPromqlStatusFlagsTool(endpoint))
  ctx.tools.register(createPromqlStatusRuntimeInfoTool(endpoint))
  ctx.tools.register(createPromqlStatusBuildInfoTool(endpoint))
  ctx.tools.register(createPromqlStatusTsdbTool(endpoint))
  ctx.tools.register(createPromqlStatusTsdbBlocksTool(endpoint))
  ctx.tools.register(createPromqlStatusWalReplayTool(endpoint))
  ctx.tools.register(createPromqlStatusSelfMetricsTool(endpoint))
  ctx.tools.register(createPromqlFeaturesTool(endpoint))

  // Search (experimental, requires --enable-feature=search-api)
  ctx.tools.register(createPromqlSearchMetricNamesTool(endpoint))
  ctx.tools.register(createPromqlSearchLabelNamesTool(endpoint))
  ctx.tools.register(createPromqlSearchLabelValuesTool(endpoint))


  // Admin (requires --web.enable-admin-api)
  ctx.tools.register(createPromqlAdminSnapshotTool(endpoint))
  ctx.tools.register(createPromqlAdminDeleteSeriesTool(endpoint))
  ctx.tools.register(createPromqlAdminCleanTombstonesTool(endpoint))
}
