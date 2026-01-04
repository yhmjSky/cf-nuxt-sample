// 客户端认证中间件
export default defineNuxtRouteMiddleware(async (to) => {
  // 不需要认证的页面
  const publicPages = ['/login']
  if (publicPages.includes(to.path)) {
    return
  }

  // 检查用户会话
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    // 保存原始目标路径
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
