import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { createPromqlFormatQueryeTool, createPromqlQueryRangeTool, createPromqlQueryTool, createPromqlSeriesTool } from './promql'

export const name = 'promql-plugin'
export const inject = ['tools']

export interface Config {
  prometheusEndpoint: string
}

export const Config: Schema<Config> = Schema.object({
  prometheusEndpoint: Schema.string().default('http://127.0.0.1:9090'),
})

export function apply(ctx: Context, config: Config) {
  ctx.tools.register(createPromqlQueryRangeTool(config.prometheusEndpoint))
  ctx.tools.register(createPromqlQueryTool(config.prometheusEndpoint))
  ctx.tools.register(createPromqlFormatQueryeTool(config.prometheusEndpoint))
  ctx.tools.register(createPromqlSeriesTool(config.prometheusEndpoint))
}
