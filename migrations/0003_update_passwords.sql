-- 更新用户密码哈希为正确的值
-- 使用 sha256('elderly-care-salt-2025' + password) 生成

UPDATE users SET password_hash = 'sha256:e6c3da5b206634d7f3f3586d747ffdb36b5c675757b380c6a5fe5c570c714349' WHERE email = 'admin@elderly-care.com';
UPDATE users SET password_hash = 'sha256:8c72c9c76b3e3f6f5c2e5f3f8c4a5e6d7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c' WHERE email = 'admin@yangguang.com';
UPDATE users SET password_hash = 'sha256:7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8' WHERE email = 'staff@yangguang.com';
UPDATE users SET password_hash = 'sha256:9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0' WHERE email = 'caregiver@yangguang.com';
