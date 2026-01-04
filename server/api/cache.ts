import type { ApiResponse } from '~/types'

// KV 缓存示例 API
// GET: 获取缓存值
// POST: 设置缓存值
export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  const { cloudflare } = event.context
  const method = event.method

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.KV) {
    // 开发环境使用内存模拟
    const memoryCache: Record<string, string> = {}

    if (method === 'GET') {
      const query = getQuery(event)
      const key = query.key as string

      if (!key) {
        return {
          success: false,
          error: '缺少 key 参数'
        }
      }

      return {
        success: true,
        data: {
          key,
          value: memoryCache[key] || null,
          message: '开发环境模拟 - KV 未持久化'
        }
      }
    }

    if (method === 'POST') {
      const body = await readBody(event)

      if (!body.key || body.value === undefined) {
        return {
          success: false,
          error: 'key 和 value 是必填项'
        }
      }

      memoryCache[body.key] = body.value

      return {
        success: true,
        message: '缓存设置成功（开发环境模拟）',
        data: { key: body.key, value: body.value }
      }
    }

    return {
      success: false,
      error: '不支持的请求方法'
    }
  }

  const kv = cloudflare.env.KV

  try {
    if (method === 'GET') {
      const query = getQuery(event)
      const key = query.key as string

      if (!key) {
        return {
          success: false,
          error: '缺少 key 参数'
        }
      }

      const value = await kv.get(key)

      return {
        success: true,
        data: { key, value }
      }
    }

    if (method === 'POST') {
      const body = await readBody(event)

      if (!body.key || body.value === undefined) {
        return {
          success: false,
          error: 'key 和 value 是必填项'
        }
      }

      // 设置缓存，可选过期时间（秒）
      const options: KVNamespacePutOptions = {}
      if (body.ttl) {
        options.expirationTtl = body.ttl
      }

      await kv.put(body.key, JSON.stringify(body.value), options)

      return {
        success: true,
        message: '缓存设置成功',
        data: { key: body.key, value: body.value }
      }
    }

    return {
      success: false,
      error: '不支持的请求方法'
    }
  } catch (error) {
    console.error('KV 操作失败:', error)
    return {
      success: false,
      error: 'KV 操作失败'
    }
  }
})
