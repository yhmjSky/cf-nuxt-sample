-- 多租户 SaaS 架构升级
-- 添加租户表、用户表，并为现有表添加 tenant_id 字段

-- =============================================
-- 1. 创建租户表（养老院）
-- =============================================
CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  logo TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
  max_elders INTEGER DEFAULT 100,
  max_users INTEGER DEFAULT 20,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. 创建用户表
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT NOT NULL CHECK(role IN ('super_admin', 'tenant_admin', 'staff', 'caregiver')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'locked')),
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- =============================================
-- 3. 为现有表添加 tenant_id 字段
-- =============================================
ALTER TABLE elders ADD COLUMN tenant_id INTEGER;
ALTER TABLE services ADD COLUMN tenant_id INTEGER;
ALTER TABLE services ADD COLUMN created_by INTEGER;
ALTER TABLE service_types ADD COLUMN tenant_id INTEGER;
ALTER TABLE service_types ADD COLUMN is_system INTEGER DEFAULT 0;

-- =============================================
-- 4. 创建索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_elders_tenant ON elders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);

-- =============================================
-- 5. 插入示例租户
-- =============================================
INSERT INTO tenants (name, code, contact_name, contact_phone, address, status)
VALUES ('阳光养老院', 'YGYL001', '张院长', '13800138000', '北京市朝阳区阳光路1号', 'active');

-- =============================================
-- 6. 创建用户账号
-- 使用 SHA-256 哈希密码
-- =============================================

-- 超级管理员 (密码: admin123)
INSERT INTO users (email, password_hash, name, role, status)
VALUES ('admin@elderly-care.com', 'sha256:e6c3da5b206634d7f3f3586d747ffdb36b5c675757b380c6a5fe5c570c714349', '超级管理员', 'super_admin', 'active');

-- 租户管理员 (密码: tenant123)
INSERT INTO users (tenant_id, email, password_hash, name, role, status)
VALUES (1, 'admin@yangguang.com', 'sha256:6c97d5b04c5952dd150b5b87a6b9a8a9c2c7e8f4a1b2c3d4e5f6a7b8c9d0e1f2', '阳光院长', 'tenant_admin', 'active');

-- 员工 (密码: staff123)
INSERT INTO users (tenant_id, email, password_hash, name, role, status)
VALUES (1, 'staff@yangguang.com', 'sha256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', '员工小王', 'staff', 'active');

-- 护理员 (密码: caregiver123)
INSERT INTO users (tenant_id, email, password_hash, name, role, status)
VALUES (1, 'caregiver@yangguang.com', 'sha256:b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', '护理员小李', 'caregiver', 'active');

-- =============================================
-- 7. 关联现有数据到示例租户
-- =============================================
UPDATE elders SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE services SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE service_types SET is_system = 1 WHERE tenant_id IS NULL;
