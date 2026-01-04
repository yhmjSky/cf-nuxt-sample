import type { ApiResponse } from '~/types'

interface KVKeyInfo {
  name: string
  expiration?: number
  metadata?: any
}

// KV 存储管理 GET API
export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  const { cloudflare } = event.context
  const query = getQuery(event)
  const action = query.action as string

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.KV) {
    return {
      success: false,
      error: 'KV 存储不可用（请确保在 Cloudflare 环境中运行）'
    }
  }

  const kv = cloudflare.env.KV

  try {
    switch (action) {
      case 'list':
        // 列出所有键
        const prefix = query.prefix as string || ''
        const limit = parseInt(query.limit as string) || 100

        const listResult = await kv.list({ prefix, limit })

        return {
          success: true,
          data: {
            keys: listResult.keys as KVKeyInfo[],
            list_complete: listResult.list_complete,
            cursor: listResult.cursor
          }
        }

      case 'get':
        // 获取单个键值
        const key = query.key as string
        if (!key) {
          return { success: false, error: '缺少 key 参数' }
        }

        const value = await kv.get(key)
        const metadata = await kv.getWithMetadata(key)

        // 尝试解析 JSON
        let parsedValue = value
        try {
          if (value) {
            parsedValue = JSON.parse(value)
          }
        } catch {
          // 保持原始字符串
        }

        return {
          success: true,
          data: {
            key,
            value: parsedValue,
            rawValue: value,
            metadata: metadata.metadata
          }
        }

      default:
        return {
          success: false,
          error: '未知操作，支持的操作: list, get'
        }
    }
  } catch (error) {
    console.error('KV 操作失败:', error)
    return {
      success: false,
      error: `操作失败: ${(error as Error).message}`
    }
  }
})
