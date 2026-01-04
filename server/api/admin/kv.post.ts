import type { ApiResponse } from '~/types'

// KV 存储管理 POST API（修改操作）
export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  const { cloudflare } = event.context
  const body = await readBody(event)

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.KV) {
    return {
      success: false,
      error: 'KV 存储不可用（请确保在 Cloudflare 环境中运行）'
    }
  }

  const kv = cloudflare.env.KV
  const { action, key, value, ttl, metadata } = body

  try {
    switch (action) {
      case 'put':
        // 设置键值
        if (!key) {
          return { success: false, error: '缺少 key 参数' }
        }

        const options: KVNamespacePutOptions = {}
        if (ttl) {
          options.expirationTtl = ttl
        }
        if (metadata) {
          options.metadata = metadata
        }

        // 将值转换为字符串
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
        await kv.put(key, stringValue, options)

        return {
          success: true,
          message: '设置成功',
          data: { key, value }
        }

      case 'delete':
        // 删除键
        if (!key) {
          return { success: false, error: '缺少 key 参数' }
        }

        await kv.delete(key)

        return {
          success: true,
          message: '删除成功',
          data: { key }
        }

      default:
        return {
          success: false,
          error: '未知操作，支持的操作: put, delete'
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
