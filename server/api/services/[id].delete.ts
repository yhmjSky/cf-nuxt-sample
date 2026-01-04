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
    const db = cloudflare.env.DB

    const result = await db.prepare('DELETE FROM services WHERE id = ?')
      .bind(parseInt(id))
      .run()

    if (result.success) {
      return {
        success: true,
        message: '删除成功'
      }
    }

    return {
      success: false,
      error: '删除失败'
    }
  } catch (error) {
    console.error('删除服务记录失败:', error)
    return {
      success: false,
      error: '删除服务记录失败'
    }
  }
})
