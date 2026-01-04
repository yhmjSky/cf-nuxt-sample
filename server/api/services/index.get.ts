import type { Service, ApiResponse } from '~/types'

// 获取服务记录列表
export default defineEventHandler(async (event): Promise<ApiResponse<Service[]>> => {
  const { cloudflare } = event.context
  const query = getQuery(event)
  const elderId = query.elderId as string | undefined

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.DB) {
    // 开发环境返回模拟数据
    return {
      success: true,
      data: [
        {
          id: 1,
          elder_id: 1,
          service_type_id: 1,
          service_type: '日常护理',
          description: '协助老人进行日常起居',
          service_date: new Date().toISOString(),
          staff_name: '护理员小张',
          status: '已完成',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          elder_id: 2,
          service_type_id: 2,
          service_type: '医疗服务',
          description: '血压测量和健康检查',
          service_date: new Date().toISOString(),
          staff_name: '医护人员小李',
          status: '进行中',
          created_at: new Date().toISOString()
        }
      ]
    }
  }

  try {
    const db = cloudflare.env.DB

    let sql = `
      SELECT s.*, e.name as elder_name 
      FROM services s 
      LEFT JOIN elders e ON s.elder_id = e.id 
    `

    if (elderId) {
      sql += ` WHERE s.elder_id = ${parseInt(elderId)}`
    }

    sql += ' ORDER BY s.service_date DESC'

    const { results } = await db.prepare(sql).all()

    return {
      success: true,
      data: results as Service[]
    }
  } catch (error) {
    console.error('获取服务记录失败:', error)
    return {
      success: false,
      error: '获取服务记录失败'
    }
  }
})
