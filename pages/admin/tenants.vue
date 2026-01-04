<template>
  <div class="tenants-page">
      <!-- 操作栏 -->
      <div class="toolbar">
        <button class="btn btn-primary" @click="openAddModal">
          <span>➕</span> 添加养老院
        </button>
      </div>

      <!-- 租户列表 -->
      <div class="tenants-grid">
        <div v-for="t in tenants" :key="t.id" class="tenant-card">
          <div class="tenant-header">
            <div class="tenant-logo">🏢</div>
            <div class="tenant-info">
              <div class="tenant-name">{{ t.name }}</div>
              <div class="tenant-code">{{ t.code }}</div>
            </div>
            <span class="status-badge" :class="t.status">{{ getStatusName(t.status) }}</span>
          </div>
          <div class="tenant-details">
            <div class="detail-item">
              <span class="label">联系人</span>
              <span class="value">{{ t.contact_name || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">电话</span>
              <span class="value">{{ t.contact_phone || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">地址</span>
              <span class="value">{{ t.address || '-' }}</span>
            </div>
          </div>
          <div class="tenant-limits">
            <div class="limit-item">
              <span class="limit-value">{{ t.max_elders }}</span>
              <span class="limit-label">最大老人数</span>
            </div>
            <div class="limit-item">
              <span class="limit-value">{{ t.max_users }}</span>
              <span class="limit-label">最大用户数</span>
            </div>
          </div>
          <div class="tenant-actions">
            <button class="btn btn-sm" @click="editTenant(t)">编辑</button>
            <button class="btn btn-sm" @click="manageTenant(t)">管理</button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="tenants.length === 0" class="empty-state">
        <div class="empty-icon">🏢</div>
        <div class="empty-text">暂无养老院</div>
      </div>
  </div>
</template>

<script setup lang="ts">
import type { Tenant } from '~/types'

const tenants = ref<Tenant[]>([])

// 模拟数据
onMounted(() => {
  tenants.value = [
    {
      id: 1,
      name: '阳光养老院',
      code: 'YGYL001',
      contact_name: '张院长',
      contact_phone: '13800138000',
      address: '北京市朝阳区阳光路1号',
      status: 'active',
      max_elders: 100,
      max_users: 20,
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    },
    {
      id: 2,
      name: '幸福养老院',
      code: 'XFYL002',
      contact_name: '李院长',
      contact_phone: '13900139000',
      address: '北京市海淀区幸福路2号',
      status: 'active',
      max_elders: 150,
      max_users: 30,
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    }
  ]
})

const getStatusName = (status: string) => {
  const names: Record<string, string> = {
    active: '正常',
    inactive: '停用',
    suspended: '已暂停'
  }
  return names[status] || status
}

const openAddModal = () => {
  alert('添加养老院功能开发中...')
}

const editTenant = (t: Tenant) => {
  alert(`编辑: ${t.name}`)
}

const manageTenant = (t: Tenant) => {
  alert(`管理: ${t.name}`)
}
</script>

<style scoped>
.tenants-page {
  max-width: 1200px;
  margin: 0 auto;
}

.toolbar {
  margin-bottom: 24px;
}

.tenants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.tenant-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: border-color 0.2s;
}

.tenant-card:hover {
  border-color: var(--primary-color);
}

.tenant-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.tenant-logo {
  font-size: 40px;
}

.tenant-info {
  flex: 1;
}

.tenant-name {
  font-size: 18px;
  font-weight: 600;
}

.tenant-code {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.inactive,
.status-badge.suspended {
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-secondary);
}

.tenant-details {
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.detail-item .label {
  font-size: 13px;
  color: var(--text-secondary);
}

.detail-item .value {
  font-size: 13px;
  font-weight: 500;
}

.tenant-limits {
  display: flex;
  gap: 24px;
  padding: 16px 0;
}

.limit-item {
  text-align: center;
  flex: 1;
}

.limit-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-light);
}

.limit-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.tenant-actions {
  display: flex;
  gap: 8px;
}

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
  padding: 8px 16px;
  font-size: 13px;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
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
</style>
