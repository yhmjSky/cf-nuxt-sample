-- 智能养老 SaaS 平台 - 初始数据库结构
-- 老人信息表
CREATE TABLE IF NOT EXISTS elders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK(gender IN ('男', '女')),
  phone TEXT,
  address TEXT,
  health_status TEXT DEFAULT '健康',
  emergency_contact TEXT,
  emergency_phone TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 服务类型表
CREATE TABLE IF NOT EXISTS service_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 服务记录表
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  elder_id INTEGER NOT NULL,
  service_type_id INTEGER,
  service_type TEXT NOT NULL,
  description TEXT,
  service_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  staff_name TEXT,
  status TEXT DEFAULT '已完成' CHECK(status IN ('待处理', '进行中', '已完成', '已取消')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (elder_id) REFERENCES elders(id) ON DELETE CASCADE,
  FOREIGN KEY (service_type_id) REFERENCES service_types(id)
);

-- 插入默认服务类型
INSERT OR IGNORE INTO service_types (name, description) VALUES 
  ('日常护理', '包括起居照料、个人卫生等'),
  ('医疗服务', '健康检查、用药管理等'),
  ('康复训练', '物理治疗、功能训练等'),
  ('心理关怀', '心理咨询、情感陪伴等'),
  ('营养配餐', '膳食规划、营养搭配等');

-- 插入示例数据
INSERT OR IGNORE INTO elders (name, age, gender, phone, address, health_status, emergency_contact, emergency_phone) VALUES 
  ('张大爷', 78, '男', '13800138001', '北京市朝阳区幸福路1号', '良好', '张小明', '13900139001'),
  ('李奶奶', 82, '女', '13800138002', '北京市海淀区和平街2号', '需关注', '李小红', '13900139002'),
  ('王大爷', 75, '男', '13800138003', '北京市西城区康乐路3号', '健康', '王小刚', '13900139003');
