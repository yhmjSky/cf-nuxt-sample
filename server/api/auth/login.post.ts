import type { SessionUser, UserRole } from '~/types'

// 登录 API
export default defineEventHandler(async (event) => {
  const { cloudflare } = event.context
  const body = await readBody(event)

  const { email, password } = body

  // 验证必填字段
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: '邮箱和密码是必填项'
    })
  }

  // 开发环境模拟用户
  if (!cloudflare?.env?.DB) {
    // 模拟用户数据
    const mockUsers = [
      { id: 1, email: 'admin@elderly-care.com', name: '超级管理员', role: 'super_admin' as UserRole, tenant_id: null, tenant_name: null },
      { id: 2, email: 'admin@yangguang.com', name: '阳光院长', role: 'tenant_admin' as UserRole, tenant_id: 1, tenant_name: '阳光养老院' },
      { id: 3, email: 'staff@yangguang.com', name: '员工小王', role: 'staff' as UserRole, tenant_id: 1, tenant_name: '阳光养老院' },
      { id: 4, email: 'caregiver@yangguang.com', name: '护理员小李', role: 'caregiver' as UserRole, tenant_id: 1, tenant_name: '阳光养老院' }
    ]

    const mockPasswords: Record<string, string> = {
      'admin@elderly-care.com': 'admin123',
      'admin@yangguang.com': 'tenant123',
      'staff@yangguang.com': 'staff123',
      'caregiver@yangguang.com': 'caregiver123'
    }

    const user = mockUsers.find(u => u.email === email)
    if (!user || mockPasswords[email] !== password) {
      throw createError({
        statusCode: 401,
        message: '邮箱或密码错误'
      })
    }

    const sessionUser: SessionUser = {
      id: user.id,
      tenant_id: user.tenant_id ?? undefined,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_name: user.tenant_name ?? undefined
    }

    // 设置用户会话
    await setUserSession(event, {
      user: sessionUser
    })

    return {
      success: true,
      user: sessionUser
    }
  }

  try {
    const db = cloudflare.env.DB

    // 查询用户（包含租户信息）
    const result = await db.prepare(`
      SELECT u.*, t.name as tenant_name 
      FROM users u 
      LEFT JOIN tenants t ON u.tenant_id = t.id 
      WHERE u.email = ? AND u.status = 'active'
    `).bind(email).first()

    if (!result) {
      throw createError({
        statusCode: 401,
        message: '邮箱或密码错误'
      })
    }

    // 验证密码
    const { verifyPassword } = await import('~/server/utils/password')
    const isValid = await verifyPassword(password, result.password_hash as string, result.email as string)

    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: '邮箱或密码错误'
      })
    }

    // 检查租户状态（非超级管理员）
    if (result.tenant_id) {
      const tenant = await db.prepare(
        'SELECT status FROM tenants WHERE id = ?'
      ).bind(result.tenant_id).first()

      if (!tenant || tenant.status !== 'active') {
        throw createError({
          statusCode: 403,
          message: '您所属的养老院已被停用'
        })
      }
    }

    const sessionUser: SessionUser = {
      id: result.id as number,
      tenant_id: result.tenant_id as number | undefined,
      email: result.email as string,
      name: result.name as string,
      role: result.role as UserRole,
      tenant_name: result.tenant_name as string | undefined
    }

    // 设置用户会话
    await setUserSession(event, {
      user: sessionUser
    })

    // 更新最后登录时间
    await db.prepare(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(result.id).run()

    return {
      success: true,
      user: sessionUser
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('登录失败:', error)
    throw createError({
      statusCode: 500,
      message: '登录失败，请稍后重试'
    })
  }
})
