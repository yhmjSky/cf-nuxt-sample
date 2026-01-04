<template>
  <div class="services-page">
      <!-- 操作栏 -->
      <div class="toolbar">
        <button class="btn btn-primary" @click="openAddModal">
          <span>➕</span> 添加服务记录
        </button>
        <div class="filters">
          <select v-model="filterElder" class="filter-select" @change="fetchServices">
            <option value="">全部老人</option>
            <option v-for="elder in elders" :key="elder.id" :value="elder.id">
              {{ elder.name }}
            </option>
          </select>
          <select v-model="filterStatus" class="filter-select" @change="fetchServices">
            <option value="">全部状态</option>
            <option value="待处理">待处理</option>
            <option value="进行中">进行中</option>
            <option value="已完成">已完成</option>
            <option value="已取消">已取消</option>
          </select>
        </div>
      </div>

      <!-- 服务记录列表 -->
      <div class="services-list">
        <div v-for="service in filteredServices" :key="service.id" class="service-card">
          <div class="service-header">
            <div class="service-type">
              <span class="type-icon">{{ getTypeIcon(service.service_type) }}</span>
              <span>{{ service.service_type }}</span>
            </div>
            <span class="status-badge" :class="getStatusClass(service.status)">
              {{ service.status }}
            </span>
          </div>
          <div class="service-body">
            <div class="service-info">
              <div class="info-item">
                <span class="label">服务对象</span>
                <span class="value">{{ service.elder_name || `ID: ${service.elder_id}` }}</span>
              </div>
              <div class="info-item">
                <span class="label">服务人员</span>
                <span class="value">{{ service.staff_name || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">服务时间</span>
                <span class="value">{{ formatDate(service.service_date) }}</span>
              </div>
            </div>
            <div v-if="service.description" class="service-desc">
              {{ service.description }}
            </div>
          </div>
          <div class="service-actions">
            <button 
              v-if="service.status === '待处理'" 
              class="btn btn-sm btn-success"
              @click="updateStatus(service.id, '进行中')"
            >
              开始服务
            </button>
            <button 
              v-if="service.status === '进行中'" 
              class="btn btn-sm btn-success"
              @click="updateStatus(service.id, '已完成')"
            >
              完成
            </button>
            <button 
              v-if="service.status !== '已完成' && service.status !== '已取消'" 
              class="btn btn-sm btn-secondary"
              @click="updateStatus(service.id, '已取消')"
            >
              取消
            </button>
            <button class="btn-icon" title="删除" @click="deleteService(service.id)">
              🗑️
            </button>
          </div>
        </div>

        <div v-if="filteredServices.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-text">暂无服务记录</div>
          <button class="btn btn-primary" @click="openAddModal">添加第一条记录</button>
        </div>
      </div>

      <!-- 添加服务记录弹窗 -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>添加服务记录</h3>
            <button class="btn-close" @click="showAddModal = false">✕</button>
          </div>
          <form class="modal-body" @submit.prevent="addService">
            <div class="form-group">
              <label>服务对象 *</label>
              <select v-model="form.elder_id" required>
                <option value="">请选择老人</option>
                <option v-for="elder in elders" :key="elder.id" :value="elder.id">
                  {{ elder.name }} ({{ elder.age }}岁)
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>服务类型 *</label>
              <select v-model="form.service_type" required @change="onTypeChange">
                <option value="">请选择服务类型</option>
                <option v-for="type in serviceTypes" :key="type.id" :value="type.name">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>服务时间</label>
                <input v-model="form.service_date" type="datetime-local" />
              </div>
              <div class="form-group">
                <label>服务人员</label>
                <input v-model="form.staff_name" type="text" placeholder="服务人员姓名" />
              </div>
            </div>
            <div class="form-group">
              <label>服务状态</label>
              <select v-model="form.status">
                <option value="待处理">待处理</option>
                <option value="进行中">进行中</option>
                <option value="已完成">已完成</option>
              </select>
            </div>
            <div class="form-group">
              <label>服务描述</label>
              <textarea v-model="form.description" rows="3" placeholder="详细描述服务内容..."></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showAddModal = false">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? '提交中...' : '确认添加' }}
              </button>
            </div>
          </form>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import type { Service, Elder, ServiceType } from '~/types'

// 数据
const services = ref<(Service & { elder_name?: string })[]>([])
const elders = ref<Elder[]>([])
const serviceTypes = ref<ServiceType[]>([])

// 筛选
const filterElder = ref('')
const filterStatus = ref('')

// 弹窗控制
const showAddModal = ref(false)
const submitting = ref(false)

// 表单
const form = ref({
  elder_id: '',
  service_type: '',
  service_type_id: null as number | null,
  service_date: '',
  staff_name: '',
  status: '待处理',
  description: ''
})

// 过滤后的服务列表
const filteredServices = computed(() => {
  let result = services.value
  if (filterStatus.value) {
    result = result.filter(s => s.status === filterStatus.value)
  }
  return result
})

// 获取服务记录
const fetchServices = async () => {
  try {
    let url = '/api/services'
    if (filterElder.value) {
      url += `?elderId=${filterElder.value}`
    }
    const response = await $fetch(url)
    if (response.success && response.data) {
      services.value = response.data
    }
  } catch (error) {
    console.error('获取服务记录失败:', error)
  }
}

// 获取老人列表
const fetchElders = async () => {
  try {
    const response = await $fetch('/api/elders')
    if (response.success && response.data) {
      elders.value = response.data
    }
  } catch (error) {
    console.error('获取老人列表失败:', error)
  }
}

// 获取服务类型
const fetchServiceTypes = async () => {
  try {
    const response = await $fetch('/api/service-types')
    if (response.success && response.data) {
      serviceTypes.value = response.data
    }
  } catch (error) {
    console.error('获取服务类型失败:', error)
  }
}

// 打开添加弹窗
const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

// 选择服务类型
const onTypeChange = () => {
  const selected = serviceTypes.value.find(t => t.name === form.value.service_type)
  form.value.service_type_id = selected?.id || null
}

// 添加服务记录
const addService = async () => {
  submitting.value = true
  try {
    const response = await $fetch('/api/services', {
      method: 'POST',
      body: {
        elder_id: parseInt(form.value.elder_id),
        service_type: form.value.service_type,
        service_type_id: form.value.service_type_id,
        service_date: form.value.service_date || undefined,
        staff_name: form.value.staff_name,
        status: form.value.status,
        description: form.value.description
      }
    })

    if (response.success) {
      showAddModal.value = false
      resetForm()
      await fetchServices()
    } else {
      alert(response.error || '添加失败')
    }
  } catch (error) {
    console.error('添加服务记录失败:', error)
    alert('添加失败')
  } finally {
    submitting.value = false
  }
}

// 更新状态
const updateStatus = async (id: number, status: string) => {
  try {
    const response = await $fetch(`/api/services/${id}`, {
      method: 'PUT',
      body: { status }
    })

    if (response.success) {
      await fetchServices()
    } else {
      alert(response.error || '更新失败')
    }
  } catch (error) {
    console.error('更新状态失败:', error)
    alert('更新失败')
  }
}

// 删除服务记录
const deleteService = async (id: number) => {
  if (!confirm('确定要删除这条服务记录吗？')) return

  try {
    const response = await $fetch(`/api/services/${id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await fetchServices()
    } else {
      alert(response.error || '删除失败')
    }
  } catch (error) {
    console.error('删除服务记录失败:', error)
    alert('删除失败')
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    elder_id: '',
    service_type: '',
    service_type_id: null,
    service_date: '',
    staff_name: '',
    status: '待处理',
    description: ''
  }
}

// 获取类型图标
const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    '日常护理': '🏠',
    '医疗服务': '🩺',
    '康复训练': '💪',
    '心理关怀': '❤️',
    '营养配餐': '🍽️'
  }
  return icons[type] || '📋'
}

// 获取状态样式
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    '待处理': 'status-pending',
    '进行中': 'status-active',
    '已完成': 'status-done',
    '已取消': 'status-cancelled'
  }
  return classes[status] || ''
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化
onMounted(async () => {
  await Promise.all([fetchServices(), fetchElders(), fetchServiceTypes()])
})
</script>

<style scoped>
.services-page {
  max-width: 1000px;
  margin: 0 auto;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* 服务列表 */
.services-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.service-card:hover {
  border-color: var(--primary-color);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.service-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.type-icon {
  font-size: 20px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-active {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.status-done {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-cancelled {
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-secondary);
}

.service-body {
  padding: 16px 20px;
}

.service-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.info-item .label {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.info-item .value {
  font-size: 14px;
  font-weight: 500;
}

.service-desc {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.service-actions {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

/* 按钮样式 */
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

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-icon {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.7;
  padding: 4px 8px;
}

.btn-icon:hover {
  opacity: 1;
}

/* 空状态 */
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
  margin-bottom: 20px;
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
  padding: 20px;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
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

/* 表单 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

@media (max-width: 768px) {
  .service-info {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
