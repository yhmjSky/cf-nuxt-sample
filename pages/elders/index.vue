<template>
  <div class="elders-page">
      <!-- 操作栏 -->
      <div class="toolbar">
        <button class="btn btn-primary" @click="showAddModal = true">
          <span>➕</span> 添加老人
        </button>
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索老人姓名..."
            class="search-input"
          />
        </div>
      </div>

      <!-- 老人列表 -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>年龄</th>
              <th>性别</th>
              <th>联系电话</th>
              <th>健康状态</th>
              <th>紧急联系人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="elder in filteredElders" :key="elder.id">
              <td>
                <div class="cell-name">
                  <div class="avatar">{{ elder.name[0] }}</div>
                  <span>{{ elder.name }}</span>
                </div>
              </td>
              <td>{{ elder.age }}岁</td>
              <td>{{ elder.gender }}</td>
              <td>{{ elder.phone || '-' }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(elder.health_status)">
                  {{ elder.health_status }}
                </span>
              </td>
              <td>{{ elder.emergency_contact || '-' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="查看" @click="viewElder(elder)">👁️</button>
                  <button class="btn-icon" title="删除" @click="confirmDelete(elder)">🗑️</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredElders.length === 0">
              <td colspan="7" class="empty-cell">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 添加老人弹窗 -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>添加老人</h3>
            <button class="btn-close" @click="showAddModal = false">✕</button>
          </div>
          <form class="modal-body" @submit.prevent="addElder">
            <div class="form-row">
              <div class="form-group">
                <label>姓名 *</label>
                <input v-model="form.name" type="text" required />
              </div>
              <div class="form-group">
                <label>年龄 *</label>
                <input v-model="form.age" type="number" min="1" max="150" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>性别</label>
                <select v-model="form.gender">
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div class="form-group">
                <label>联系电话</label>
                <input v-model="form.phone" type="tel" />
              </div>
            </div>
            <div class="form-group">
              <label>地址</label>
              <input v-model="form.address" type="text" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>健康状态</label>
                <select v-model="form.health_status">
                  <option value="健康">健康</option>
                  <option value="良好">良好</option>
                  <option value="需关注">需关注</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>紧急联系人</label>
                <input v-model="form.emergency_contact" type="text" />
              </div>
              <div class="form-group">
                <label>紧急联系电话</label>
                <input v-model="form.emergency_phone" type="tel" />
              </div>
            </div>
            <div class="form-group">
              <label>备注</label>
              <textarea v-model="form.notes" rows="3"></textarea>
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

      <!-- 查看详情弹窗 -->
      <div v-if="selectedElder" class="modal-overlay" @click.self="selectedElder = null">
        <div class="modal">
          <div class="modal-header">
            <h3>老人详情</h3>
            <button class="btn-close" @click="selectedElder = null">✕</button>
          </div>
          <div class="modal-body detail-view">
            <div class="detail-avatar">{{ selectedElder.name[0] }}</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">姓名</span>
                <span class="value">{{ selectedElder.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">年龄</span>
                <span class="value">{{ selectedElder.age }}岁</span>
              </div>
              <div class="detail-item">
                <span class="label">性别</span>
                <span class="value">{{ selectedElder.gender }}</span>
              </div>
              <div class="detail-item">
                <span class="label">电话</span>
                <span class="value">{{ selectedElder.phone || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">地址</span>
                <span class="value">{{ selectedElder.address || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">健康状态</span>
                <span class="value">
                  <span class="status-badge" :class="getStatusClass(selectedElder.health_status)">
                    {{ selectedElder.health_status }}
                  </span>
                </span>
              </div>
              <div class="detail-item">
                <span class="label">紧急联系人</span>
                <span class="value">{{ selectedElder.emergency_contact || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">紧急电话</span>
                <span class="value">{{ selectedElder.emergency_phone || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import type { Elder } from '~/types'

// 老人列表
const elders = ref<Elder[]>([])

// 搜索
const searchQuery = ref('')

// 弹窗控制
const showAddModal = ref(false)
const selectedElder = ref<Elder | null>(null)
const submitting = ref(false)

// 表单数据
const form = ref({
  name: '',
  age: '',
  gender: '男',
  phone: '',
  address: '',
  health_status: '健康',
  emergency_contact: '',
  emergency_phone: '',
  notes: ''
})

// 过滤后的列表
const filteredElders = computed(() => {
  if (!searchQuery.value) return elders.value
  return elders.value.filter(e =>
    e.name.includes(searchQuery.value)
  )
})

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

// 添加老人
const addElder = async () => {
  submitting.value = true
  try {
    const response = await $fetch('/api/elders', {
      method: 'POST',
      body: {
        ...form.value,
        age: parseInt(form.value.age)
      }
    })

    if (response.success) {
      showAddModal.value = false
      resetForm()
      await fetchElders()
    } else {
      alert(response.error || '添加失败')
    }
  } catch (error) {
    console.error('添加老人失败:', error)
    alert('添加失败')
  } finally {
    submitting.value = false
  }
}

// 查看老人详情
const viewElder = (elder: Elder) => {
  selectedElder.value = elder
}

// 确认删除
const confirmDelete = async (elder: Elder) => {
  if (!confirm(`确定要删除 ${elder.name} 的信息吗？`)) return

  try {
    const response = await $fetch(`/api/elders/${elder.id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await fetchElders()
    } else {
      alert(response.error || '删除失败')
    }
  } catch (error) {
    console.error('删除老人失败:', error)
    alert('删除失败')
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    age: '',
    gender: '男',
    phone: '',
    address: '',
    health_status: '健康',
    emergency_contact: '',
    emergency_phone: '',
    notes: ''
  }
}

// 获取状态样式
const getStatusClass = (status: string) => {
  if (status === '健康' || status === '良好') return 'status-healthy'
  if (status === '需关注') return 'status-warning'
  return 'status-normal'
}

// 初始化
onMounted(fetchElders)
</script>

<style scoped>
.elders-page {
  max-width: 1200px;
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

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
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

.btn-secondary:hover {
  background: var(--border-color);
}

.btn-icon {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

/* 表格样式 */
.table-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background: var(--bg-tertiary);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: rgba(99, 102, 241, 0.05);
}

.cell-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-healthy {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-normal {
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-cell {
  text-align: center !important;
  color: var(--text-secondary);
  padding: 40px !important;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

/* 表单样式 */
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
}

/* 详情视图 */
.detail-view {
  text-align: center;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: white;
  margin: 0 auto 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  text-align: left;
}

.detail-item {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 12px 16px;
}

.detail-item .label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.detail-item .value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}
</style>
