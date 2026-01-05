import { useDrizzle, services } from '~/server/db'
import type { ApiResponse } from '~/types'
import type { Service } from '~/server/db/schema'

// 添加服务记录
export default defineEventHandler(async (event): Promise<ApiResponse<Service>> => {
  const { cloudflare } = event.context
  const body = await readBody(event)

  // 验证必填字段
  if (!body.elder_id || !body.service_type) {
    return {
      success: false,
      error: '老人和服务类型是必填项'
    }
  }

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.DB) {
    // 开发环境返回模拟数据
    return {
      success: true,
      message: '添加成功（模拟）',
      data: {
        id: Date.now(),
        tenant_id: 1,
        elder_id: body.elder_id,
        service_type_id: body.service_type_id,
        service_type: body.service_type,
        description: body.description || '',
        service_date: body.service_date || new Date().toISOString(),
        staff_name: body.staff_name || '',
        status: body.status || '待处理',
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  try {
    const db = useDrizzle(cloudflare.env.DB)

    const result = await db.insert(services).values({
      elder_id: body.elder_id,
      service_type_id: body.service_type_id || null,
      service_type: body.service_type,
      description: body.description || '',
      service_date: body.service_date || new Date().toISOString(),
      staff_name: body.staff_name || '',
      status: body.status || '待处理',
      tenant_id: 1, // TODO: 从会话获取租户 ID
    }).returning()

    return {
      success: true,
      message: '添加成功',
      data: result[0]
    }
  } catch (error) {
    console.error('添加服务记录失败:', error)
    return {
      success: false,
      error: '添加服务记录失败'
    }
  }
})
