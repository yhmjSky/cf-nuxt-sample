import type { DashboardStats, ApiResponse } from '~/types'

// 获取仪表盘统计数据
export default defineEventHandler(async (event): Promise<ApiResponse<DashboardStats>> => {
  const { cloudflare } = event.context

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.DB) {
    // 开发环境返回模拟数据
    return {
      success: true,
      data: {
        totalElders: 3,
        healthyCount: 2,
        needAttentionCount: 1,
        todayServices: 5
      }
    }
  }

  try {
    const db = cloudflare.env.DB

    // 获取老人总数
    const totalResult = await db.prepare('SELECT COUNT(*) as count FROM elders').first()
    const totalElders = (totalResult as any)?.count || 0

    // 获取健康状态统计
    const healthyResult = await db.prepare(
      "SELECT COUNT(*) as count FROM elders WHERE health_status IN ('健康', '良好')"
    ).first()
    const healthyCount = (healthyResult as any)?.count || 0

    const needAttentionResult = await db.prepare(
      "SELECT COUNT(*) as count FROM elders WHERE health_status = '需关注'"
    ).first()
    const needAttentionCount = (needAttentionResult as any)?.count || 0

    // 获取今日服务数量
    const today = new Date().toISOString().split('T')[0]
    const servicesResult = await db.prepare(
      "SELECT COUNT(*) as count FROM services WHERE DATE(service_date) = ?"
    ).bind(today).first()
    const todayServices = (servicesResult as any)?.count || 0

    return {
      success: true,
      data: {
        totalElders,
        healthyCount,
        needAttentionCount,
        todayServices
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return {
      success: false,
      error: '获取统计数据失败'
    }
  }
})
