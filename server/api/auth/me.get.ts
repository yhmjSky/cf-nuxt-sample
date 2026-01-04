// 获取当前用户信息
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    return {
      success: false,
      user: null
    }
  }

  return {
    success: true,
    user: session.user
  }
})
