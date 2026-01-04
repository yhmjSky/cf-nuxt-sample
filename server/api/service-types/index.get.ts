import type { ServiceType, ApiResponse } from '~/types'

// 获取服务类型列表
export default defineEventHandler(async (event): Promise<ApiResponse<ServiceType[]>> => {
  const { cloudflare } = event.context

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.DB) {
    // 开发环境返回模拟数据
    return {
      success: true,
      data: [
        { id: 1, name: '日常护理', description: '包括起居照料、个人卫生等', created_at: new Date().toISOString() },
        { id: 2, name: '医疗服务', description: '健康检查、用药管理等', created_at: new Date().toISOString() },
        { id: 3, name: '康复训练', description: '物理治疗、功能训练等', created_at: new Date().toISOString() },
        { id: 4, name: '心理关怀', description: '心理咨询、情感陪伴等', created_at: new Date().toISOString() },
        { id: 5, name: '营养配餐', description: '膳食规划、营养搭配等', created_at: new Date().toISOString() }
      ]
    }
  }

  try {
    const db = cloudflare.env.DB
    const { results } = await db.prepare('SELECT * FROM service_types ORDER BY id').all()

    return {
      success: true,
      data: results as ServiceType[]
    }
  } catch (error) {
    console.error('获取服务类型失败:', error)
    return {
      success: false,
      error: '获取服务类型失败'
    }
  }
})
