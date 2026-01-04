<template>
  <div class="app-layout">
    <!-- 侧边导航 -->
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-icon">🏠</span>
        <span class="logo-text">智慧养老</span>
      </div>

      <!-- 租户信息 -->
      <div v-if="user?.tenant_name" class="tenant-info">
        <span class="tenant-name">{{ user.tenant_name }}</span>
      </div>

      <nav class="nav-menu">
        <!-- 超级管理员视图：平台管理 -->
        <template v-if="isSuperAdmin">
          <NuxtLink to="/" class="nav-item" active-class="active">
            <span class="nav-icon">📊</span>
            <span>平台概览</span>
          </NuxtLink>

          <div class="nav-divider"></div>
          <div class="nav-group-title">平台管理</div>

          <NuxtLink to="/admin/tenants" class="nav-item" active-class="active">
            <span class="nav-icon">🏢</span>
            <span>养老院管理</span>
          </NuxtLink>

          <div class="nav-divider"></div>
          <div class="nav-group-title">开发工具</div>

          <NuxtLink to="/admin/d1" class="nav-item" active-class="active">
            <span class="nav-icon">🗄️</span>
            <span>D1 数据库</span>
          </NuxtLink>
          <NuxtLink to="/admin/kv" class="nav-item" active-class="active">
            <span class="nav-icon">�</span>
            <span>KV 存储</span>
          </NuxtLink>
        </template>

        <!-- 租户用户视图：业务功能 -->
        <template v-else>
          <NuxtLink to="/" class="nav-item" active-class="active">
            <span class="nav-icon">📊</span>
            <span>仪表盘</span>
          </NuxtLink>
          <NuxtLink to="/elders" class="nav-item" active-class="active">
            <span class="nav-icon">👴</span>
            <span>老人管理</span>
          </NuxtLink>
          <NuxtLink to="/services" class="nav-item" active-class="active">
            <span class="nav-icon">🩺</span>
            <span>服务记录</span>
          </NuxtLink>

          <!-- 租户管理员：用户管理 -->
          <template v-if="isTenantAdmin">
            <div class="nav-divider"></div>
            <div class="nav-group-title">管理功能</div>

            <NuxtLink to="/admin/users" class="nav-item" active-class="active">
              <span class="nav-icon">�</span>
              <span>用户管理</span>
            </NuxtLink>
          </template>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="version">v2.0.0 SaaS</div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="top-bar">
        <div class="page-title">
          <slot name="title">智能养老管理平台</slot>
        </div>
        <div class="user-section">
          <div class="user-info" @click="showUserMenu = !showUserMenu">
            <span class="user-avatar">{{ getRoleIcon(user?.role) }}</span>
            <div class="user-details">
              <span class="user-name">{{ user?.name || '用户' }}</span>
              <span class="user-role">{{ getRoleName(user?.role) }}</span>
            </div>
            <span class="dropdown-arrow">▼</span>
          </div>

          <!-- 用户菜单 -->
          <div v-if="showUserMenu" class="user-menu" @click.stop>
            <div class="menu-header">
              <div class="menu-user-name">{{ user?.name }}</div>
              <div class="menu-user-email">{{ user?.email }}</div>
            </div>
            <div class="menu-divider"></div>
            <button class="menu-item" @click="handleLogout">
              <span>🚪</span> 退出登录
            </button>
          </div>
        </div>
      </header>
      <div class="content-area">
        <slot />
      </div>
    </main>

    <!-- 点击外部关闭菜单 -->
    <div v-if="showUserMenu" class="menu-overlay" @click="showUserMenu = false"></div>
  </div>
</template>

<script setup lang="ts">
import type { SessionUser, UserRole } from '~/types'

// 启用认证中间件
definePageMeta({
  middleware: 'auth'
})

const { user, clear: clearSession } = useUserSession()
const showUserMenu = ref(false)

// 类型转换
const currentUser = computed(() => user.value as SessionUser | null)

// 权限判断
const isSuperAdmin = computed(() => currentUser.value?.role === 'super_admin')
const isTenantAdmin = computed(() => currentUser.value?.role === 'tenant_admin')
const isAdmin = computed(() => ['super_admin', 'tenant_admin'].includes(currentUser.value?.role || ''))

// 获取角色图标
const getRoleIcon = (role?: UserRole) => {
  const icons: Record<UserRole, string> = {
    super_admin: '👑',
    tenant_admin: '🏢',
    staff: '👤',
    caregiver: '👩‍⚕️'
  }
  return role ? icons[role] : '👤'
}

// 获取角色名称
const getRoleName = (role?: UserRole) => {
  const names: Record<UserRole, string> = {
    super_admin: '超级管理员',
    tenant_admin: '养老院管理员',
    staff: '员工',
    caregiver: '护理员'
  }
  return role ? names[role] : '用户'
}

// 登出
const handleLogout = async () => {
  showUserMenu.value = false
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clearSession()
  await navigateTo('/login')
}
</script>


<style>
/* 全局样式变量 */
:root {
  --primary-color: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --bg-color: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --sidebar-width: 240px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-color);
  color: var(--text-primary);
  min-height: 100vh;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏样式 */
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-color) 100%);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.logo {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  padding: 16px 12px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.nav-icon {
  font-size: 20px;
}

.nav-divider {
  height: 1px;
  background: var(--border-color);
  margin: 16px 0;
}

.nav-group-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 16px 8px;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.version {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 64px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.user-section {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-info:hover {
  background: var(--bg-color);
}

.user-avatar {
  font-size: 24px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 11px;
  color: var(--text-secondary);
}

.dropdown-arrow {
  font-size: 10px;
  color: var(--text-secondary);
  margin-left: 4px;
}

/* 用户菜单 */
.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  min-width: 200px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  z-index: 100;
  overflow: hidden;
}

.menu-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
}

.menu-user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.menu-user-email {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.menu-divider {
  height: 1px;
  background: var(--border-color);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: var(--bg-tertiary);
}

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
}

/* 租户信息 */
.tenant-info {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-color);
}

.tenant-name {
  font-size: 12px;
  color: var(--primary-light);
  font-weight: 500;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
