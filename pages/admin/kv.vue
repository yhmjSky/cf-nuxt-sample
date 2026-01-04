<template>
  <div class="admin-page">
      <!-- 操作栏 -->
      <div class="section">
        <div class="section-header">
          <h2>🔑 KV 键值存储</h2>
          <div class="actions">
            <button class="btn btn-primary btn-sm" @click="showAddKey = true">➕ 新增</button>
            <button class="btn btn-sm" @click="loadKeys">🔄 刷新</button>
          </div>
        </div>

        <!-- 搜索 -->
        <div class="search-bar">
          <input
            v-model="prefix"
            type="text"
            placeholder="按前缀搜索..."
            class="search-input"
            @keyup.enter="loadKeys"
          />
          <button class="btn btn-sm" @click="loadKeys">搜索</button>
        </div>
      </div>

      <!-- 键列表 -->
      <div class="section">
        <h2>📋 键列表</h2>
        <div class="key-list">
          <div
            v-for="key in keys"
            :key="key.name"
            class="key-item"
            :class="{ active: selectedKey === key.name }"
            @click="selectKey(key.name)"
          >
            <div class="key-name">{{ key.name }}</div>
            <div v-if="key.expiration" class="key-expiry">
              过期: {{ formatDate(key.expiration) }}
            </div>
          </div>
          <div v-if="!keys.length" class="empty">暂无数据</div>
        </div>

        <div v-if="!listComplete" class="load-more">
          <button class="btn btn-sm" @click="loadMoreKeys">加载更多...</button>
        </div>
      </div>

      <!-- 键详情 -->
      <div v-if="selectedKey && keyValue" class="section">
        <div class="section-header">
          <h2>🔍 {{ selectedKey }}</h2>
          <div class="actions">
            <button class="btn btn-sm" @click="editKey">✏️ 编辑</button>
            <button class="btn btn-sm btn-danger" @click="deleteKey">🗑️ 删除</button>
          </div>
        </div>

        <div class="value-display">
          <div class="value-header">
            <span class="label">值</span>
            <span class="type-badge">{{ valueType }}</span>
          </div>
          <pre class="value-content">{{ formattedValue }}</pre>
        </div>

        <div v-if="keyValue.metadata" class="metadata">
          <div class="label">元数据</div>
          <pre>{{ JSON.stringify(keyValue.metadata, null, 2) }}</pre>
        </div>
      </div>

      <!-- 新增/编辑弹窗 -->
      <div v-if="showAddKey" class="modal-overlay" @click.self="showAddKey = false">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ editMode ? '编辑键值' : '新增键值' }}</h3>
            <button class="btn-close" @click="showAddKey = false">✕</button>
          </div>
          <form class="modal-body" @submit.prevent="saveKey">
            <div class="form-group">
              <label>键名 *</label>
              <input v-model="form.key" type="text" required :disabled="editMode" />
            </div>
            <div class="form-group">
              <label>值 *</label>
              <textarea v-model="form.value" rows="6" required></textarea>
              <div class="hint">支持 JSON 格式，会自动序列化</div>
            </div>
            <div class="form-group">
              <label>过期时间 (秒)</label>
              <input v-model.number="form.ttl" type="number" min="60" placeholder="留空表示永不过期" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showAddKey = false">取消</button>
              <button type="submit" class="btn btn-primary">{{ editMode ? '保存' : '添加' }}</button>
            </div>
          </form>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
interface KVKey {
  name: string
  expiration?: number
  metadata?: any
}

interface KVValue {
  key: string
  value: any
  rawValue: string
  metadata?: any
}

// 状态
const keys = ref<KVKey[]>([])
const listComplete = ref(true)
const cursor = ref<string | null>(null)
const prefix = ref('')
const selectedKey = ref<string | null>(null)
const keyValue = ref<KVValue | null>(null)
const showAddKey = ref(false)
const editMode = ref(false)
const form = ref({
  key: '',
  value: '',
  ttl: null as number | null
})

// 值类型
const valueType = computed(() => {
  if (!keyValue.value) return 'unknown'
  const val = keyValue.value.value
  if (val === null) return 'null'
  if (typeof val === 'object') return 'json'
  return typeof val
})

// 格式化的值
const formattedValue = computed(() => {
  if (!keyValue.value) return ''
  const val = keyValue.value.value
  if (typeof val === 'object') {
    return JSON.stringify(val, null, 2)
  }
  return String(val)
})

// 加载键列表
const loadKeys = async () => {
  cursor.value = null
  try {
    const res = await $fetch(`/api/admin/kv?action=list&prefix=${encodeURIComponent(prefix.value)}&limit=50`)
    if (res.success) {
      keys.value = res.data.keys
      listComplete.value = res.data.list_complete
      cursor.value = res.data.cursor
    }
  } catch (error) {
    console.error('加载键列表失败:', error)
  }
}

// 加载更多
const loadMoreKeys = async () => {
  if (!cursor.value) return
  try {
    const res = await $fetch(`/api/admin/kv?action=list&prefix=${encodeURIComponent(prefix.value)}&cursor=${cursor.value}`)
    if (res.success) {
      keys.value = [...keys.value, ...res.data.keys]
      listComplete.value = res.data.list_complete
      cursor.value = res.data.cursor
    }
  } catch (error) {
    console.error('加载更多失败:', error)
  }
}

// 选择键
const selectKey = async (key: string) => {
  selectedKey.value = key
  try {
    const res = await $fetch(`/api/admin/kv?action=get&key=${encodeURIComponent(key)}`)
    if (res.success) {
      keyValue.value = res.data
    }
  } catch (error) {
    console.error('加载键值失败:', error)
  }
}

// 编辑键
const editKey = () => {
  if (!keyValue.value) return
  editMode.value = true
  form.value = {
    key: keyValue.value.key,
    value: typeof keyValue.value.value === 'object' 
      ? JSON.stringify(keyValue.value.value, null, 2) 
      : String(keyValue.value.value),
    ttl: null
  }
  showAddKey.value = true
}

// 保存键
const saveKey = async () => {
  try {
    // 尝试解析 JSON
    let value = form.value.value
    try {
      value = JSON.parse(form.value.value)
    } catch {
      // 保持为字符串
    }

    const res = await $fetch('/api/admin/kv', {
      method: 'POST',
      body: {
        action: 'put',
        key: form.value.key,
        value,
        ttl: form.value.ttl || undefined
      }
    })

    if (res.success) {
      showAddKey.value = false
      form.value = { key: '', value: '', ttl: null }
      editMode.value = false
      await loadKeys()
      if (selectedKey.value === form.value.key) {
        await selectKey(form.value.key)
      }
    } else {
      alert('保存失败: ' + res.error)
    }
  } catch (error) {
    alert('保存失败: ' + (error as Error).message)
  }
}

// 删除键
const deleteKey = async () => {
  if (!selectedKey.value) return
  if (!confirm(`确定要删除 "${selectedKey.value}" 吗？`)) return

  try {
    const res = await $fetch('/api/admin/kv', {
      method: 'POST',
      body: {
        action: 'delete',
        key: selectedKey.value
      }
    })

    if (res.success) {
      selectedKey.value = null
      keyValue.value = null
      await loadKeys()
    } else {
      alert('删除失败: ' + res.error)
    }
  } catch (error) {
    alert('删除失败: ' + (error as Error).message)
  }
}

// 格式化日期
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString()
}

// 初始化
onMounted(loadKeys)
</script>

<style scoped>
.admin-page {
  max-width: 1000px;
  margin: 0 auto;
}

.section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.actions {
  display: flex;
  gap: 8px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* 键列表 */
.key-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.key-item {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.key-item:hover {
  border-color: var(--primary-color);
}

.key-item.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.key-name {
  font-weight: 500;
  font-size: 14px;
  word-break: break-all;
}

.key-expiry {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.key-item.active .key-expiry {
  color: rgba(255,255,255,0.7);
}

.load-more {
  margin-top: 16px;
  text-align: center;
}

/* 值显示 */
.value-display {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
}

.value-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.type-badge {
  background: var(--primary-color);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.value-content {
  margin: 0;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-primary);
}

.metadata {
  margin-top: 16px;
  background: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
}

.metadata pre {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-danger {
  background: var(--danger-color);
  color: white;
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
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 16px;
  margin: 0;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
}

.form-group textarea {
  font-family: 'Fira Code', monospace;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.hint {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.empty {
  color: var(--text-secondary);
  font-size: 13px;
  text-align: center;
  padding: 24px;
}
</style>
