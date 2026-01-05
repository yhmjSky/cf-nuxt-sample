-- 数据库结构修复迁移
-- 添加 services 表缺失的 updated_at 字段

-- 为 services 表添加 updated_at 字段
ALTER TABLE services ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 更新现有记录
UPDATE services SET updated_at = created_at WHERE updated_at IS NULL;
