// 生成正确的密码哈希（用于更新迁移脚本）
import { hashPassword } from './password'

async function generateHashes() {
  const hashes = {
    admin123: await hashPassword('admin123'),
    tenant123: await hashPassword('tenant123'),
    staff123: await hashPassword('staff123'),
    caregiver123: await hashPassword('caregiver123')
  }
  
  console.log('Password Hashes:')
  console.log(JSON.stringify(hashes, null, 2))
}

generateHashes()
