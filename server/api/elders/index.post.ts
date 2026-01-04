import type { Elder, ApiResponse } from '~/types'

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
    const db = cloudflare.env.DB

    const result = await db.prepare(`
      INSERT INTO elders (name, age, gender, phone, address, health_status, emergency_contact, emergency_phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.name,
      body.age,
      body.gender || '男',
      body.phone || '',
      body.address || '',
      body.health_status || '健康',
      body.emergency_contact || '',
      body.emergency_phone || '',
      body.notes || ''
    ).run()

    if (result.success) {
      // 获取新插入的记录
      const { results } = await db.prepare('SELECT * FROM elders WHERE id = ?')
        .bind(result.meta.last_row_id)
        .all()

      return {
        success: true,
        message: '添加成功',
        data: results[0] as Elder
      }
    }

    return {
      success: false,
      error: '添加失败'
    }
  } catch (error) {
    console.error('添加老人失败:', error)
    return {
      success: false,
      error: '添加老人失败'
    }
  }
})
