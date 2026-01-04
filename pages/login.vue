<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo 和标题 -->
      <div class="login-header">
        <div class="logo">🏠</div>
        <h1>智慧养老 SaaS 平台</h1>
        <p>多租户智能养老服务管理系统</p>
      </div>

      <!-- 登录表单 -->
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>邮箱</label>
          <input
            v-model="credentials.email"
            type="email"
            placeholder="请输入邮箱"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            v-model="credentials.password"
            type="password"
            placeholder="请输入密码"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">登录中...</span>
          <span v-else>登 录</span>
        </button>
      </form>

      <!-- 测试账号提示 -->
      <div class="demo-accounts">
        <h4>演示账号</h4>
        <div class="account-list">
          <div class="account-item" @click="fillAccount('admin@elderly-care.com', 'admin123')">
            <span class="role">超级管理员</span>
            <span class="email">admin@elderly-care.com</span>
          </div>
          <div class="account-item" @click="fillAccount('admin@yangguang.com', 'tenant123')">
            <span class="role">养老院管理员</span>
            <span class="email">admin@yangguang.com</span>
          </div>
          <div class="account-item" @click="fillAccount('staff@yangguang.com', 'staff123')">
            <span class="role">员工</span>
            <span class="email">staff@yangguang.com</span>
          </div>
          <div class="account-item" @click="fillAccount('caregiver@yangguang.com', 'caregiver123')">
            <span class="role">护理员</span>
            <span class="email">caregiver@yangguang.com</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 不使用默认布局
definePageMeta({
  layout: false
})

const { fetch: refreshSession } = useUserSession()
const route = useRoute()

const credentials = ref({
  email: '',
  password: ''
})
const error = ref('')
const loading = ref(false)

// 填充测试账号
const fillAccount = (email: string, password: string) => {
  credentials.value.email = email
  credentials.value.password = password
  error.value = ''
}

// 处理登录
const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials.value
    })

    if (response.success) {
      // 刷新会话
      await refreshSession()
      
      // 跳转到原始目标或首页
      const redirect = route.query.redirect as string || '/'
      await navigateTo(redirect)
    }
  } catch (err: any) {
    error.value = err.data?.message || '登录失败，请检查邮箱和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 10;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo {
  font-size: 64px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #94a3b8;
}

.login-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 15px;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group input::placeholder {
  color: #64748b;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  color: #f87171;
  font-size: 13px;
  margin-bottom: 16px;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 演示账号 */
.demo-accounts {
  border-top: 1px solid rgba(99, 102, 241, 0.2);
  padding-top: 24px;
}

.demo-accounts h4 {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  text-align: center;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.account-item:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.account-item .role {
  font-size: 12px;
  font-weight: 500;
  color: #818cf8;
}

.account-item .email {
  font-size: 12px;
  color: #94a3b8;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
}

.circle-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -200px;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -100px;
}

.circle-3 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@media (max-width: 480px) {
  .login-container {
    padding: 32px 24px;
  }
}
</style>
