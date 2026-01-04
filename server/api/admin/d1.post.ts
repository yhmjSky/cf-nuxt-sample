import type { ApiResponse } from '~/types'

// D1 数据库管理 POST API（执行修改操作）
export default defineEventHandler(async (event): Promise<ApiResponse<any>> => {
  const { cloudflare } = event.context
  const body = await readBody(event)

  // 检查是否在 Cloudflare 环境中
  if (!cloudflare?.env?.DB) {
    return {
      success: false,
      error: '数据库不可用（请确保在 Cloudflare 环境中运行）'
    }
  }

  const db = cloudflare.env.DB
  const { action, table, data, sql, id } = body

  try {
    switch (action) {
      case 'insert':
        // 插入数据
        if (!table || !data) {
          return { success: false, error: '缺少 table 或 data 参数' }
        }

        const columns = Object.keys(data)
        const values = Object.values(data)
        const placeholders = columns.map(() => '?').join(', ')

        const insertResult = await db.prepare(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
        ).bind(...values).run()

        return {
          success: insertResult.success,
          message: '插入成功',
          data: { lastRowId: insertResult.meta.last_row_id }
        }

      case 'update':
        // 更新数据
        if (!table || !data || !id) {
          return { success: false, error: '缺少 table, data 或 id 参数' }
        }

        const updateColumns = Object.keys(data)
        const updateValues = Object.values(data)
        const setClause = updateColumns.map(col => `${col} = ?`).join(', ')

        const updateResult = await db.prepare(
          `UPDATE ${table} SET ${setClause} WHERE id = ?`
        ).bind(...updateValues, id).run()

        return {
          success: updateResult.success,
          message: '更新成功',
          data: { changes: updateResult.meta.changes }
        }

      case 'delete':
        // 删除数据
        if (!table || !id) {
          return { success: false, error: '缺少 table 或 id 参数' }
        }

        const deleteResult = await db.prepare(
          `DELETE FROM ${table} WHERE id = ?`
        ).bind(id).run()

        return {
          success: deleteResult.success,
          message: '删除成功',
          data: { changes: deleteResult.meta.changes }
        }

      case 'execute':
        // 执行任意 SQL
        if (!sql) {
          return { success: false, error: '缺少 sql 参数' }
        }

        // 安全警告
        console.warn('⚠️ 执行自定义 SQL:', sql)

        const sqlResult = await db.prepare(sql).run()

        return {
          success: sqlResult.success,
          message: 'SQL 执行成功',
          data: {
            changes: sqlResult.meta.changes,
            lastRowId: sqlResult.meta.last_row_id
          }
        }

      default:
        return {
          success: false,
          error: '未知操作，支持的操作: insert, update, delete, execute'
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
