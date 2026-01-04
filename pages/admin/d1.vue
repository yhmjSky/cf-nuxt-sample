<template>
  <div class="admin-page">
      <!-- 数据库信息 -->
      <div class="section">
        <div class="section-header">
          <h2>📊 数据库概览</h2>
          <button class="btn btn-sm" @click="loadDbInfo">🔄 刷新</button>
        </div>
        <div v-if="dbInfo" class="info-grid">
          <div class="info-card">
            <span class="info-value">{{ dbInfo.tableCount }}</span>
            <span class="info-label">数据表</span>
          </div>
        </div>
      </div>

      <!-- 表列表 -->
      <div class="section">
        <h2>📋 数据表</h2>
        <div class="table-cards">
          <div
            v-for="table in dbInfo?.tables"
            :key="table.name"
            class="table-card"
            :class="{ active: selectedTable === table.name }"
            @click="selectTable(table.name)"
          >
            <div class="table-name">{{ table.name }}</div>
            <div class="table-type">{{ table.type }}</div>
          </div>
          <div v-if="!dbInfo?.tables?.length" class="empty">暂无数据表</div>
        </div>
      </div>

      <!-- 表详情 -->
      <div v-if="selectedTable" class="section">
        <div class="section-header">
          <h2>🔍 {{ selectedTable }}</h2>
          <div class="actions">
            <button class="btn btn-sm btn-primary" @click="showAddRow = true">➕ 新增</button>
            <button class="btn btn-sm" @click="loadTableData">🔄 刷新</button>
          </div>
        </div>

        <!-- 表结构 -->
        <div v-if="tableInfo" class="sub-section">
          <h3>表结构 ({{ tableInfo.rowCount }} 行)</h3>
          <table class="mini-table">
            <thead>
              <tr>
                <th>列名</th>
                <th>类型</th>
                <th>主键</th>
                <th>非空</th>
                <th>默认值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="col in tableInfo.columns" :key="col.name">
                <td><code>{{ col.name }}</code></td>
                <td>{{ col.type }}</td>
                <td>{{ col.pk ? '✅' : '' }}</td>
                <td>{{ col.notnull ? '✅' : '' }}</td>
                <td>{{ col.dflt_value ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 表数据 -->
        <div class="sub-section">
          <h3>数据预览</h3>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th v-for="col in tableInfo?.columns" :key="col.name">{{ col.name }}</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableData" :key="row.id">
                  <td v-for="col in tableInfo?.columns" :key="col.name">
                    <span class="cell-value">{{ formatValue(row[col.name]) }}</span>
                  </td>
                  <td>
                    <button class="btn-icon" title="删除" @click="deleteRow(row.id)">🗑️</button>
                  </td>
                </tr>
                <tr v-if="!tableData.length">
                  <td :colspan="(tableInfo?.columns?.length || 0) + 1" class="empty-cell">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SQL 控制台 -->
      <div class="section">
        <h2>⚡ SQL 控制台</h2>
        <div class="sql-console">
          <textarea
            v-model="sqlQuery"
            placeholder="输入 SQL 语句..."
            rows="3"
            class="sql-input"
          ></textarea>
          <div class="sql-actions">
            <button class="btn btn-primary" @click="executeSQL" :disabled="!sqlQuery.trim()">
              ▶️ 执行
            </button>
            <span class="hint">SELECT 语句直接执行，其他语句需确认</span>
          </div>
        </div>

        <!-- SQL 结果 -->
        <div v-if="sqlResult" class="sql-result">
          <div v-if="sqlResult.success" class="result-success">
            <pre>{{ JSON.stringify(sqlResult.data, null, 2) }}</pre>
          </div>
          <div v-else class="result-error">
            ❌ {{ sqlResult.error }}
          </div>
        </div>
      </div>

      <!-- 新增数据弹窗 -->
      <div v-if="showAddRow" class="modal-overlay" @click.self="showAddRow = false">
        <div class="modal">
          <div class="modal-header">
            <h3>新增数据 - {{ selectedTable }}</h3>
            <button class="btn-close" @click="showAddRow = false">✕</button>
          </div>
          <form class="modal-body" @submit.prevent="insertRow">
            <div v-for="col in editableColumns" :key="col.name" class="form-group">
              <label>{{ col.name }} <span class="type-hint">({{ col.type }})</span></label>
              <input v-model="newRowData[col.name]" :required="col.notnull && !col.dflt_value" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showAddRow = false">取消</button>
              <button type="submit" class="btn btn-primary">确认添加</button>
            </div>
          </form>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
interface TableInfo {
  name: string
  type: string
  sql: string
}

interface ColumnInfo {
  cid: number
  name: string
  type: string
  notnull: number
  dflt_value: any
  pk: number
}

interface DbInfo {
  tables: TableInfo[]
  tableCount: number
}

// 状态
const dbInfo = ref<DbInfo | null>(null)
const selectedTable = ref<string | null>(null)
const tableInfo = ref<{ columns: ColumnInfo[], rowCount: number } | null>(null)
const tableData = ref<any[]>([])
const sqlQuery = ref('')
const sqlResult = ref<any>(null)
const showAddRow = ref(false)
const newRowData = ref<Record<string, any>>({})

// 可编辑列（排除自增主键）
const editableColumns = computed(() => {
  return tableInfo.value?.columns.filter(col => !col.pk || col.type !== 'INTEGER') || []
})

// 加载数据库信息
const loadDbInfo = async () => {
  try {
    const res = await $fetch('/api/admin/d1?action=info')
    if (res.success) {
      dbInfo.value = res.data
    }
  } catch (error) {
    console.error('加载数据库信息失败:', error)
  }
}

// 选择表
const selectTable = async (tableName: string) => {
  selectedTable.value = tableName
  newRowData.value = {}
  await loadTableInfo()
  await loadTableData()
}

// 加载表信息
const loadTableInfo = async () => {
  if (!selectedTable.value) return
  try {
    const res = await $fetch(`/api/admin/d1?action=table-info&table=${selectedTable.value}`)
    if (res.success) {
      tableInfo.value = res.data
    }
  } catch (error) {
    console.error('加载表信息失败:', error)
  }
}

// 加载表数据
const loadTableData = async () => {
  if (!selectedTable.value) return
  try {
    const res = await $fetch(`/api/admin/d1?action=query&table=${selectedTable.value}&limit=50`)
    if (res.success) {
      tableData.value = res.data.rows
    }
  } catch (error) {
    console.error('加载表数据失败:', error)
  }
}

// 执行 SQL
const executeSQL = async () => {
  const sql = sqlQuery.value.trim()
  if (!sql) return

  const isSelect = sql.toUpperCase().startsWith('SELECT')

  if (!isSelect) {
    if (!confirm('⚠️ 即将执行非查询语句，确定继续吗？\n\n' + sql)) {
      return
    }
  }

  try {
    if (isSelect) {
      const res = await $fetch(`/api/admin/d1?action=execute&sql=${encodeURIComponent(sql)}`)
      sqlResult.value = res
    } else {
      const res = await $fetch('/api/admin/d1', {
        method: 'POST',
        body: { action: 'execute', sql }
      })
      sqlResult.value = res
      // 刷新当前表数据
      if (selectedTable.value) {
        await loadTableData()
      }
    }
  } catch (error) {
    sqlResult.value = { success: false, error: (error as Error).message }
  }
}

// 插入行
const insertRow = async () => {
  if (!selectedTable.value) return

  try {
    const res = await $fetch('/api/admin/d1', {
      method: 'POST',
      body: {
        action: 'insert',
        table: selectedTable.value,
        data: newRowData.value
      }
    })

    if (res.success) {
      showAddRow.value = false
      newRowData.value = {}
      await loadTableData()
      await loadTableInfo()
    } else {
      alert('插入失败: ' + res.error)
    }
  } catch (error) {
    alert('插入失败: ' + (error as Error).message)
  }
}

// 删除行
const deleteRow = async (id: number) => {
  if (!selectedTable.value) return
  if (!confirm('确定要删除这条记录吗？')) return

  try {
    const res = await $fetch('/api/admin/d1', {
      method: 'POST',
      body: {
        action: 'delete',
        table: selectedTable.value,
        id
      }
    })

    if (res.success) {
      await loadTableData()
      await loadTableInfo()
    } else {
      alert('删除失败: ' + res.error)
    }
  } catch (error) {
    alert('删除失败: ' + (error as Error).message)
  }
}

// 格式化值
const formatValue = (value: any) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  const str = String(value)
  return str.length > 50 ? str.substring(0, 50) + '...' : str
}

// 初始化
onMounted(loadDbInfo)
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
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

.sub-section {
  margin-top: 20px;
}

.sub-section h3 {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

/* 信息卡片 */
.info-grid {
  display: flex;
  gap: 16px;
}

.info-card {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 16px 24px;
  text-align: center;
}

.info-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-light);
}

.info-label {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 表卡片 */
.table-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.table-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.table-card:hover {
  border-color: var(--primary-color);
}

.table-card.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.table-name {
  font-weight: 600;
  font-size: 14px;
}

.table-type {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.table-card.active .table-type {
  color: rgba(255,255,255,0.7);
}

/* 迷你表格 */
.mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.mini-table th,
.mini-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.mini-table th {
  background: var(--bg-tertiary);
  font-weight: 500;
  color: var(--text-secondary);
}

.mini-table code {
  background: var(--bg-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

/* 数据表格 */
.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.data-table th {
  background: var(--bg-tertiary);
  font-weight: 500;
  color: var(--text-secondary);
  position: sticky;
  top: 0;
}

.cell-value {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.empty-cell {
  text-align: center !important;
  color: var(--text-secondary);
  padding: 24px !important;
}

/* SQL 控制台 */
.sql-console {
  margin-bottom: 16px;
}

.sql-input {
  width: 100%;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-primary);
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  resize: vertical;
}

.sql-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.sql-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.sql-result {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.result-success pre {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

.result-error {
  color: var(--danger-color);
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
}

.btn-icon:hover {
  opacity: 1;
}

.actions {
  display: flex;
  gap: 8px;
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
  max-width: 480px;
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

.type-hint {
  font-weight: 400;
  color: var(--text-secondary);
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.empty {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
