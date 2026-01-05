import { useDrizzle, services } from '~/server/db'
import { eq } from 'drizzle-orm'
import type { ApiResponse } from '~/types'

// 删除服务记录
export default defineEventHandler(async (event): Promise<ApiResponse<null>> => {
  const { cloudflare } = event.context
  const id = getRouterParam(event, 'id')

  if (!id) {
    return {
      success: false,
      error: '缺少 ID 参数'
    }
  }

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.DB) {
    return {
      success: true,
      message: '删除成功（模拟）'
    }
  }

  try {
    const db = useDrizzle(cloudflare.env.DB)

    await db.delete(services).where(eq(services.id, parseInt(id)))

    return {
      success: true,
      message: '删除成功'
    }
  } catch (error) {
    console.error('删除服务记录失败:', error)
    return {
      success: false,
      error: '删除服务记录失败'
    }
  }
})
