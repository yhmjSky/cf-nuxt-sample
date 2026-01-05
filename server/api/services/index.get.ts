import { useDrizzle, services, elders } from '~/server/db'
import { desc, eq } from 'drizzle-orm'
import type { ApiResponse } from '~/types'
import type { Service } from '~/server/db/schema'

// 扩展类型包含老人名称
type ServiceWithElderName = Service & { elder_name?: string | null }

// 获取服务记录列表
export default defineEventHandler(async (event): Promise<ApiResponse<ServiceWithElderName[]>> => {
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
          tenant_id: 1,
          elder_id: 1,
          service_type_id: 1,
          service_type: '日常护理',
          description: '协助老人进行日常起居',
          service_date: new Date().toISOString(),
          staff_name: '护理员小张',
          status: '已完成',
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          elder_name: '张大爷'
        },
        {
          id: 2,
          tenant_id: 1,
          elder_id: 2,
          service_type_id: 2,
          service_type: '医疗服务',
          description: '血压测量和健康检查',
          service_date: new Date().toISOString(),
          staff_name: '医护人员小李',
          status: '进行中',
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          elder_name: '李奶奶'
        }
      ]
    }
  }

  try {
    const db = useDrizzle(cloudflare.env.DB)

    // 使用 Drizzle 查询并关联 elders 表
    let queryBuilder = db
      .select({
        id: services.id,
        tenant_id: services.tenant_id,
        elder_id: services.elder_id,
        service_type_id: services.service_type_id,
        service_type: services.service_type,
        description: services.description,
        service_date: services.service_date,
        staff_name: services.staff_name,
        status: services.status,
        created_by: services.created_by,
        created_at: services.created_at,
        updated_at: services.updated_at,
        elder_name: elders.name,
      })
      .from(services)
      .leftJoin(elders, eq(services.elder_id, elders.id))
      .orderBy(desc(services.service_date))

    // 如果指定了 elderId，添加过滤条件
    const results = elderId
      ? await queryBuilder.where(eq(services.elder_id, parseInt(elderId)))
      : await queryBuilder

    return {
      success: true,
      data: results as ServiceWithElderName[]
    }
  } catch (error) {
    console.error('获取服务记录失败:', error)
    return {
      success: false,
      error: '获取服务记录失败'
    }
  }
})
