import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'

const DEFAULT_TIMEOUT_MS = 30_000

function stripPrefix(name: string): string {
  return name.startsWith('promql-') ? name.slice('promql-'.length) : name
}

export interface RequestOptions {
  /** Short name used for the error prefix, e.g. "query". */
  name: string
  /** Request path, e.g. "/api/v1/query". May contain pre-encoded path segments. */
  path: string
  /** Query string parameters. */
  params?: URLSearchParams
  /** HTTP method (default GET). */
  method?: 'GET' | 'POST'
  /** Request body (used for POST). */
  body?: string
  /** Timeout in milliseconds (default 30000). */
  timeoutMs?: number
  /** Parse response body as JSON and stringify it (default true). If false, return raw text. */
  json?: boolean
}

export async function promRequest(endpoint: string, opts: RequestOptions): Promise<string> {
  const {
    name,
    path,
    params,
    method = 'GET',
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    json = true,
  } = opts

  const base = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
  const p = path.startsWith('/') ? path : '/' + path
  const url = new URL(base + p)
  if (params) {
    for (const [k, v] of params.entries()) url.searchParams.append(k, v)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let response: Response
  try {
    response = await fetch(url.toString(), { method, body, signal: controller.signal })
  } catch (e) {
    clearTimeout(timer)
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`promql-${name}: request timed out after ${timeoutMs}ms`)
    }
    throw new Error(`promql-${name}: request failed — ${(e as Error).message}`)
  }
  clearTimeout(timer)

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`promql-${name}: HTTP ${response.status} — ${detail}`)
  }

  if (json) {
    return JSON.stringify(await response.json())
  }
  return await response.text()
}

/**
 * Build a parameterless (or scalar-only) GET tool. Array query parameters such
 * as `match[]` are NOT supported here — for those use promRequest() directly.
 */
export function createSimpleGetTool(
  name: string,
  path: string,
  description: string,
  parameters: Record<string, any> = {},
  json = true,
) {
  return (endpoint: string) => defineTool({
    name,
    description,
    parameters,
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute(_args: Record<string, unknown>, _exec: ToolRunContext): Promise<string> {
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(_args)) {
        if (v === undefined || v === null || v === '') continue
        params.set(k, String(v))
      }
      return promRequest(endpoint, { name: stripPrefix(name), path, params, json })
    },
  })
}
