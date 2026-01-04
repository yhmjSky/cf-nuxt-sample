<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
          👴
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalElders }}</div>
          <div class="stat-label">老人总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #34d399)">
          ✅
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.healthyCount }}</div>
          <div class="stat-label">健康状态</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #fbbf24)">
          ⚠️
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.needAttentionCount }}</div>
          <div class="stat-label">需关注</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #06b6d4, #22d3ee)">
          🩺
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.todayServices }}</div>
          <div class="stat-label">今日服务</div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="section">
      <h2 class="section-title">快速操作</h2>
      <div class="quick-actions">
        <NuxtLink to="/elders" class="action-card">
          <span class="action-icon">➕</span>
          <span class="action-text">添加老人</span>
        </NuxtLink>
        <div class="action-card" @click="testApi">
          <span class="action-icon">🔌</span>
          <span class="action-text">测试 API</span>
        </div>
        <div class="action-card" @click="testKV">
          <span class="action-icon">💾</span>
          <span class="action-text">测试 KV</span>
        </div>
      </div>
    </div>

    <!-- 最近老人列表 -->
    <div class="section">
      <h2 class="section-title">最近添加的老人</h2>
      <div class="elder-list">
        <div v-for="elder in recentElders" :key="elder.id" class="elder-card">
          <div class="elder-avatar">{{ elder.name[0] }}</div>
          <div class="elder-info">
            <div class="elder-name">{{ elder.name }}</div>
            <div class="elder-details">{{ elder.age }}岁 · {{ elder.gender }}</div>
          </div>
          <div class="elder-status" :class="getStatusClass(elder.health_status)">
            {{ elder.health_status }}
          </div>
        </div>
        <div v-if="recentElders.length === 0" class="empty-state">
          暂无数据
        </div>
      </div>
    </div>

    <!-- API 测试结果 -->
    <div v-if="apiResult" class="section">
      <h2 class="section-title">API 测试结果</h2>
      <pre class="api-result">{{ JSON.stringify(apiResult, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Elder, DashboardStats } from '~/types'

// 统计数据
const stats = ref<DashboardStats>({
  totalElders: 0,
  healthyCount: 0,
  needAttentionCount: 0,
  todayServices: 0
})

// 最近老人列表
const recentElders = ref<Elder[]>([])

// API 测试结果
const apiResult = ref<any>(null)

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await $fetch('/api/stats')
    if (response.success && response.data) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取老人列表
const fetchElders = async () => {
  try {
    const response = await $fetch('/api/elders')
    if (response.success && response.data) {
      recentElders.value = response.data.slice(0, 5)
    }
  } catch (error) {
    console.error('获取老人列表失败:', error)
  }
}

// 测试 API
const testApi = async () => {
  try {
    const response = await $fetch('/api/elders')
    apiResult.value = response
  } catch (error) {
    apiResult.value = { error: '请求失败' }
  }
}

// 测试 KV
const testKV = async () => {
  try {
    // 先设置一个值
    await $fetch('/api/cache', {
      method: 'POST',
      body: { key: 'test-key', value: { message: 'Hello from KV!', time: new Date().toISOString() } }
    })

    // 然后获取
    const response = await $fetch('/api/cache?key=test-key')
    apiResult.value = response
  } catch (error) {
    apiResult.value = { error: 'KV 测试失败' }
  }
}

// 获取状态样式类
const getStatusClass = (status: string) => {
  if (status === '健康' || status === '良好') return 'status-healthy'
  if (status === '需关注') return 'status-warning'
  return 'status-normal'
}

// 初始化加载数据
onMounted(() => {
  fetchStats()
  fetchElders()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 区块标题 */
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

/* 快速操作 */
.quick-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: var(--text-primary);
}

.action-card:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}

.action-icon {
  font-size: 24px;
}

.action-text {
  font-size: 15px;
  font-weight: 500;
}

/* 老人列表 */
.elder-list {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
}

.elder-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s ease;
}

.elder-card:last-child {
  border-bottom: none;
}

.elder-card:hover {
  background: var(--bg-tertiary);
}

.elder-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.elder-info {
  flex: 1;
}

.elder-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.elder-details {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.elder-status {
  padding: 6px 12px;
  border-radius: 20px;
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

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}

/* API 结果 */
.api-result {
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 16px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  color: var(--text-secondary);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
