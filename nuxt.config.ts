// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // 模块配置
  modules: [
    'nuxt-auth-utils'
  ],

  // Cloudflare Pages 部署配置
  nitro: {
    preset: 'cloudflare-pages'
  },

  // 运行时配置
  runtimeConfig: {
    // 会话密钥（从环境变量读取）
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || 'a-very-long-secret-key-for-session-encryption-32chars'
    }
  },

  // 应用配置
  app: {
    head: {
      title: '智能养老 SaaS 平台',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '基于 Nuxt + Cloudflare 的智能养老服务管理平台' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
