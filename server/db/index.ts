import { drizzle } from 'drizzle-orm/d1'
import type { D1Database } from '@cloudflare/workers-types'
import * as schema from './schema'

// 从 D1 实例创建 Drizzle 客户端
export function useDrizzle(d1: D1Database) {
  return drizzle(d1 as any, { schema })
}

// 导出 schema
export * from './schema'

// 类型定义
export type DrizzleDB = ReturnType<typeof useDrizzle>
