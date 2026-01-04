import type { ApiResponse } from '~/types'

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

interface D1Info {
  tables: TableInfo[]
  tableCount: number
}

// D1 数据库管理 API
export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  const { cloudflare } = event.context
  const query = getQuery(event)
  const action = query.action as string

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.DB) {
    return {
      success: false,
      error: '数据库不可用（请确保在 Cloudflare 环境中运行）'
    }
  }

  const db = cloudflare.env.DB

  try {
    switch (action) {
      case 'info':
        // 获取数据库基本信息
        const tablesResult = await db.prepare(
          "SELECT name, type, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'"
        ).all()

        return {
          success: true,
          data: {
            tables: tablesResult.results as TableInfo[],
            tableCount: tablesResult.results.length
          } as D1Info
        }

      case 'table-info':
        // 获取表结构信息
        const tableName = query.table as string
        if (!tableName) {
          return { success: false, error: '缺少 table 参数' }
        }

        // 获取列信息
        const columnsResult = await db.prepare(`PRAGMA table_info(${tableName})`).all()
        
        // 获取行数
        const countResult = await db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).first()

        return {
          success: true,
          data: {
            tableName,
            columns: columnsResult.results as ColumnInfo[],
            rowCount: (countResult as any)?.count || 0
          }
        }

      case 'query':
        // 获取表数据
        const queryTable = query.table as string
        const limit = parseInt(query.limit as string) || 50
        const offset = parseInt(query.offset as string) || 0

        if (!queryTable) {
          return { success: false, error: '缺少 table 参数' }
        }

        const dataResult = await db.prepare(
          `SELECT * FROM ${queryTable} LIMIT ? OFFSET ?`
        ).bind(limit, offset).all()

        return {
          success: true,
          data: {
            rows: dataResult.results,
            count: dataResult.results.length
          }
        }

      case 'execute':
        // 执行自定义 SQL（仅限 SELECT）
        const sql = query.sql as string
        if (!sql) {
          return { success: false, error: '缺少 sql 参数' }
        }

        // 安全检查：仅允许 SELECT 语句（GET 请求）
        if (!sql.trim().toUpperCase().startsWith('SELECT')) {
          return { success: false, error: '仅允许执行 SELECT 语句（修改操作请使用 POST）' }
        }

        const sqlResult = await db.prepare(sql).all()

        return {
          success: true,
          data: {
            results: sqlResult.results,
            meta: sqlResult.meta
          }
        }

      default:
        return {
          success: false,
          error: '未知操作，支持的操作: info, table-info, query, execute'
        }
    }
  } catch (error) {
    console.error('D1 操作失败:', error)
    return {
      success: false,
      error: `操作失败: ${(error as Error).message}`
    }
  }
})
