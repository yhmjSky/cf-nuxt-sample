import { useDrizzle, elders } from '~/server/db'
import type { ApiResponse } from '~/types'
import type { Elder } from '~/server/db/schema'

// 添加新老人
export default defineEventHandler(async (event): Promise<ApiResponse<Elder>> => {
  const { cloudflare } = event.context
  const body = await readBody(event)

  // 验证必填字段
  if (!body.name || !body.age) {
    return {
      success: false,
      error: '姓名和年龄是必填项'
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
        name: body.name,
        age: body.age,
        gender: body.gender || '男',
        phone: body.phone || '',
        address: body.address || '',
        health_status: body.health_status || '健康',
        emergency_contact: body.emergency_contact || '',
        emergency_phone: body.emergency_phone || '',
        notes: body.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  try {
    const db = useDrizzle(cloudflare.env.DB)

    const result = await db.insert(elders).values({
      name: body.name,
      age: body.age,
      gender: body.gender || '男',
      phone: body.phone || '',
      address: body.address || '',
      health_status: body.health_status || '健康',
      emergency_contact: body.emergency_contact || '',
      emergency_phone: body.emergency_phone || '',
      notes: body.notes || '',
      tenant_id: 1, // TODO: 从会话获取租户 ID
    }).returning()

    return {
      success: true,
      message: '添加成功',
      data: result[0]
    }
  } catch (error) {
    console.error('添加老人失败:', error)
    return {
      success: false,
      error: '添加老人失败'
    }
  }
})
