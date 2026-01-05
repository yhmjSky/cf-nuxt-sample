import { useDrizzle, elders } from '~/server/db'
import { eq } from 'drizzle-orm'
import type { ApiResponse } from '~/types'

// 删除老人记录
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
    // 开发环境返回模拟成功
    return {
      success: true,
      message: '删除成功（模拟）'
    }
  }

  try {
    const db = useDrizzle(cloudflare.env.DB)

    // 由于设置了 ON DELETE CASCADE，删除老人会自动删除相关服务记录
    await db.delete(elders).where(eq(elders.id, parseInt(id)))

    return {
      success: true,
      message: '删除成功'
    }
  } catch (error) {
    console.error('删除老人失败:', error)
    return {
      success: false,
      error: '删除老人失败'
    }
  }
})
