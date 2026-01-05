import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './server/db/schema.ts',
  dialect: 'sqlite',
  // 本地开发使用文件数据库
  // 远程部署时使用 d1-http driver
  dbCredentials: {
    url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local-dev-db.sqlite'
  },
})
