// 密码工具函数（简单实现，生产环境应使用 bcrypt）
// 注意：Cloudflare Workers 不支持 Node.js 原生 bcrypt，使用 Web Crypto API

/**
 * 生成密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  
  // 使用 SHA-256 + 固定盐值（简化版本）
  // 生产环境应使用随机盐值并存储
  const salt = 'elderly-care-salt-2025'
  const saltedData = encoder.encode(salt + password)
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedData)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `sha256:${hashHex}`
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hash: string, email?: string): Promise<boolean> {
  // 开发环境简化验证：直接匹配邮箱和密码对
  if (email && hash.startsWith('dev-')) {
    const devPasswords: Record<string, string> = {
      'admin@elderly-care.com': 'admin123',
      'admin@yangguang.com': 'tenant123',
      'staff@yangguang.com': 'staff123',
      'caregiver@yangguang.com': 'caregiver123'
    }
    return devPasswords[email] === password
  }
  
  // 生产环境：验证哈希
  const computed = await hashPassword(password)
  return computed === hash
}

/**
 * 生成默认密码哈希（用于数据库初始化）
 */
export async function generateDefaultHashes() {
  return {
    admin123: await hashPassword('admin123'),
    tenant123: await hashPassword('tenant123'),
    staff123: await hashPassword('staff123'),
    caregiver123: await hashPassword('caregiver123')
  }
}
