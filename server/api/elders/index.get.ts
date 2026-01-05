import { useDrizzle, elders } from '~/server/db'
import { desc } from 'drizzle-orm'
import type { ApiResponse } from '~/types'
import type { Elder } from '~/server/db/schema'

// 获取老人列表
export default defineEventHandler(async (event): Promise<ApiResponse<Elder[]>> => {
  const { cloudflare } = event.context

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.DB) {
    // 开发环境返回模拟数据
    return {
      success: true,
      data: [
        {
          id: 1,
          tenant_id: 1,
          name: '张大爷',
          age: 78,
          gender: '男',
          phone: '13800138001',
          address: '北京市朝阳区幸福路1号',
          health_status: '良好',
          emergency_contact: '张小明',
          emergency_phone: '13900139001',
          notes: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          tenant_id: 1,
          name: '李奶奶',
          age: 82,
          gender: '女',
          phone: '13800138002',
          address: '北京市海淀区和平街2号',
          health_status: '需关注',
          emergency_contact: '李小红',
          emergency_phone: '13900139002',
          notes: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          tenant_id: 1,
          name: '王大爷',
          age: 75,
          gender: '男',
          phone: '13800138003',
          address: '北京市西城区康乐路3号',
          health_status: '健康',
          emergency_contact: '王小刚',
          emergency_phone: '13900139003',
          notes: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  }

  try {
    const db = useDrizzle(cloudflare.env.DB)
    const results = await db.select().from(elders).orderBy(desc(elders.created_at))

    return {
      success: true,
      data: results
    }
  } catch (error) {
    console.error('获取老人列表失败:', error)
    return {
      success: false,
      error: '获取老人列表失败'
    }
  }
})
