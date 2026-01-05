import { useDrizzle, services } from '~/server/db'
import { eq } from 'drizzle-orm'
import type { ApiResponse } from '~/types'

// 更新服务记录状态
export default defineEventHandler(async (event): Promise<ApiResponse<null>> => {
  const { cloudflare } = event.context
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

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
      message: '更新成功（模拟）'
    }
  }

  try {
    const db = useDrizzle(cloudflare.env.DB)

    // 构建更新数据
    const updateData: Partial<{
      status: string
      description: string
      staff_name: string
      updated_at: string
    }> = {
      updated_at: new Date().toISOString()
    }

    if (body.status !== undefined) {
      updateData.status = body.status
    }
    if (body.description !== undefined) {
      updateData.description = body.description
    }
    if (body.staff_name !== undefined) {
      updateData.staff_name = body.staff_name
    }

    if (Object.keys(updateData).length === 1) {
      return {
        success: false,
        error: '没有需要更新的字段'
      }
    }

    await db.update(services)
      .set(updateData)
      .where(eq(services.id, parseInt(id)))

    return {
      success: true,
      message: '更新成功'
    }
  } catch (error) {
    console.error('更新服务记录失败:', error)
    return {
      success: false,
      error: '更新服务记录失败'
    }
  }
})
