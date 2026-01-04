import type { Elder, ApiResponse } from '~/types'

// 获取单个老人详情
export default defineEventHandler(async (event): Promise<ApiResponse<Elder>> => {
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
    // 开发环境返回模拟数据
    return {
      success: true,
      data: {
        id: parseInt(id),
        name: '张大爷',
        age: 78,
        gender: '男',
        phone: '13800138001',
        address: '北京市朝阳区幸福路1号',
        health_status: '良好',
        emergency_contact: '张小明',
        emergency_phone: '13900139001',
        notes: '无特殊备注',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  try {
    const db = cloudflare.env.DB
    const { results } = await db.prepare('SELECT * FROM elders WHERE id = ?')
      .bind(parseInt(id))
      .all()

    if (results.length === 0) {
      return {
        success: false,
        error: '未找到该老人信息'
      }
    }

    return {
      success: true,
      data: results[0] as Elder
    }
  } catch (error) {
    console.error('获取老人详情失败:', error)
    return {
      success: false,
      error: '获取老人详情失败'
    }
  }
})
