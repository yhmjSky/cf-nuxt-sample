<template>
  <div class="users-page">
      <!-- 操作栏 -->
      <div class="toolbar">
        <button class="btn btn-primary" @click="openAddModal">
          <span>➕</span> 添加用户
        </button>
      </div>

      <!-- 用户列表 -->
      <div class="users-grid">
        <div v-for="u in users" :key="u.id" class="user-card">
          <div class="user-header">
            <div class="user-avatar">{{ getRoleIcon(u.role) }}</div>
            <div class="user-info">
              <div class="user-name">{{ u.name }}</div>
              <div class="user-email">{{ u.email }}</div>
            </div>
            <span class="status-badge" :class="u.status">{{ u.status }}</span>
          </div>
          <div class="user-details">
            <div class="detail-item">
              <span class="label">角色</span>
              <span class="value">{{ getRoleName(u.role) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">电话</span>
              <span class="value">{{ u.phone || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">最后登录</span>
              <span class="value">{{ formatDate(u.last_login_at) }}</span>
            </div>
          </div>
          <div class="user-actions">
            <button class="btn btn-sm" @click="editUser(u)">编辑</button>
            <button class="btn btn-sm btn-danger" @click="deleteUser(u.id)">删除</button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="users.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-text">暂无用户</div>
      </div>

      <!-- 添加/编辑用户弹窗 -->
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
            <button class="btn-close" @click="showModal = false">✕</button>
          </div>
          <form class="modal-body" @submit.prevent="saveUser">
            <div class="form-group">
              <label>姓名 *</label>
              <input v-model="form.name" type="text" required />
            </div>
            <div class="form-group">
              <label>邮箱 *</label>
              <input v-model="form.email" type="email" required :disabled="!!editingUser" />
            </div>
            <div v-if="!editingUser" class="form-group">
              <label>密码 *</label>
              <input v-model="form.password" type="password" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>角色 *</label>
                <select v-model="form.role" required>
                  <option value="staff">员工</option>
                  <option value="caregiver">护理员</option>
                  <option v-if="isTenantAdmin" value="tenant_admin">养老院管理员</option>
                </select>
              </div>
              <div class="form-group">
                <label>状态</label>
                <select v-model="form.status">
                  <option value="active">正常</option>
                  <option value="inactive">停用</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>电话</label>
              <input v-model="form.phone" type="tel" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showModal = false">取消</button>
              <button type="submit" class="btn btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import type { User, UserRole } from '~/types'

const { user: currentUser } = useUserSession()
const users = ref<User[]>([])
const showModal = ref(false)
const editingUser = ref<User | null>(null)

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'staff' as UserRole,
  status: 'active' as 'active' | 'inactive',
  phone: ''
})

const isTenantAdmin = computed(() => (currentUser.value as any)?.role === 'tenant_admin')

// 模拟数据
onMounted(() => {
  users.value = [
    { id: 2, tenant_id: 1, email: 'admin@yangguang.com', name: '阳光院长', role: 'tenant_admin', status: 'active', created_at: '2025-01-01', updated_at: '2025-01-01' },
    { id: 3, tenant_id: 1, email: 'staff@yangguang.com', name: '员工小王', role: 'staff', status: 'active', phone: '13800138001', created_at: '2025-01-01', updated_at: '2025-01-01' },
    { id: 4, tenant_id: 1, email: 'caregiver@yangguang.com', name: '护理员小李', role: 'caregiver', status: 'active', phone: '13800138002', last_login_at: '2025-12-31T10:00:00', created_at: '2025-01-01', updated_at: '2025-01-01' }
  ]
})

const getRoleIcon = (role: UserRole) => {
  const icons: Record<UserRole, string> = {
    super_admin: '👑',
    tenant_admin: '🏢',
    staff: '👤',
    caregiver: '👩‍⚕️'
  }
  return icons[role]
}

const getRoleName = (role: UserRole) => {
  const names: Record<UserRole, string> = {
    super_admin: '超级管理员',
    tenant_admin: '养老院管理员',
    staff: '员工',
    caregiver: '护理员'
  }
  return names[role]
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const openAddModal = () => {
  editingUser.value = null
  form.value = { name: '', email: '', password: '', role: 'staff', status: 'active', phone: '' }
  showModal.value = true
}

const editUser = (u: User) => {
  editingUser.value = u
  form.value = { name: u.name, email: u.email, password: '', role: u.role, status: u.status, phone: u.phone || '' }
  showModal.value = true
}

const saveUser = () => {
  // TODO: 调用 API 保存
  alert('功能开发中...')
  showModal.value = false
}

const deleteUser = (id: number) => {
  if (!confirm('确定要删除此用户吗？')) return
  users.value = users.value.filter(u => u.id !== id)
}
</script>

<style scoped>
.users-page {
  max-width: 1000px;
  margin: 0 auto;
}

.toolbar {
  margin-bottom: 24px;
}

.users-grid {
  display: grid;
  gap: 16px;
}

.user-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.user-avatar {
  font-size: 32px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
}

.user-email {
  font-size: 13px;
  color: var(--text-secondary);
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.inactive {
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-secondary);
}

.user-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.detail-item .label {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.detail-item .value {
  font-size: 13px;
  font-weight: 500;
}

.user-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}

/* 按钮和表单样式继承自全局 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 20px;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
