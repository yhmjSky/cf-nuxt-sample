// 登出 API
export default defineEventHandler(async (event) => {
  // 清除用户会话
  await clearUserSession(event)

  return {
    success: true,
    message: '已成功登出'
  }
})
