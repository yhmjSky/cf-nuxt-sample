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
    const db = cloudflare.env.DB

    // 构建更新字段
    const updates: string[] = []
    const values: any[] = []

    if (body.status !== undefined) {
      updates.push('status = ?')
      values.push(body.status)
    }
    if (body.description !== undefined) {
      updates.push('description = ?')
      values.push(body.description)
    }
    if (body.staff_name !== undefined) {
      updates.push('staff_name = ?')
      values.push(body.staff_name)
    }

    if (updates.length === 0) {
      return {
        success: false,
        error: '没有需要更新的字段'
      }
    }

    values.push(parseInt(id))

    const result = await db.prepare(
      `UPDATE services SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run()

    if (result.success) {
      return {
        success: true,
        message: '更新成功'
      }
    }

    return {
      success: false,
      error: '更新失败'
    }
  } catch (error) {
    console.error('更新服务记录失败:', error)
    return {
      success: false,
      error: '更新服务记录失败'
    }
  }
})
