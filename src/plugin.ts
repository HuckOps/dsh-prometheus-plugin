import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'

export const name = 'promql-plugin'
export const inject = ['tools']

export interface Config {
    prometheusEndpoint: string
}

export const Config: Schema<Config> = Schema.object({
  prometheusEndpoint: Schema.string().default('http://127.0.0.1:9090')
})

export function apply(ctx: Context, config: Config) {
  // Required dependencies are ready before apply runs.
  console.log('[promql-plugin] plugin loaded!')
  
}