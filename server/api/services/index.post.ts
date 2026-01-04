import type { Service, ApiResponse } from '~/types'

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
        elder_id: body.elder_id,
        service_type_id: body.service_type_id,
        service_type: body.service_type,
        description: body.description || '',
        service_date: body.service_date || new Date().toISOString(),
        staff_name: body.staff_name || '',
        status: body.status || '待处理',
        created_at: new Date().toISOString()
      }
    }
  }

  try {
    const db = cloudflare.env.DB

    const result = await db.prepare(`
      INSERT INTO services (elder_id, service_type_id, service_type, description, service_date, staff_name, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.elder_id,
      body.service_type_id || null,
      body.service_type,
      body.description || '',
      body.service_date || new Date().toISOString(),
      body.staff_name || '',
      body.status || '待处理'
    ).run()

    if (result.success) {
      // 获取新插入的记录
      const { results } = await db.prepare('SELECT * FROM services WHERE id = ?')
        .bind(result.meta.last_row_id)
        .all()

      return {
        success: true,
        message: '添加成功',
        data: results[0] as Service
      }
    }

    return {
      success: false,
      error: '添加失败'
    }
  } catch (error) {
    console.error('添加服务记录失败:', error)
    return {
      success: false,
      error: '添加服务记录失败'
    }
  }
})
