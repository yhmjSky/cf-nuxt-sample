// Cloudflare 绑定类型声明
export interface CloudflareEnv {
  DB: D1Database
  KV: KVNamespace
}

// 老人信息类型
export interface Elder {
  id: number
  name: string
  age: number
  gender: '男' | '女'
  phone?: string
  address?: string
  health_status: string
  emergency_contact?: string
  emergency_phone?: string
  notes?: string
  created_at: string
  updated_at: string
}

// 服务记录类型
export interface Service {
  id: number
  elder_id: number
  service_type_id?: number
  service_type: string
  description?: string
  service_date: string
  staff_name?: string
  status: '待处理' | '进行中' | '已完成' | '已取消'
  created_at: string
}

// 服务类型
export interface ServiceType {
  id: number
  name: string
  description?: string
  created_at: string
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 统计数据类型
export interface DashboardStats {
  totalElders: number
  healthyCount: number
  needAttentionCount: number
  todayServices: number
}

// =============================================
// 多租户 SaaS 类型定义
// =============================================

// 用户角色
export type UserRole = 'super_admin' | 'tenant_admin' | 'staff' | 'caregiver'

// 角色权限配置
export const RolePermissions: Record<UserRole, string[]> = {
  super_admin: ['*'], // 所有权限
  tenant_admin: ['tenant:manage', 'user:manage', 'elder:manage', 'service:manage'],
  staff: ['elder:view', 'elder:manage', 'service:view', 'service:manage'],
  caregiver: ['elder:view', 'service:view', 'service:create']
}

// 租户/养老院类型
export interface Tenant {
  id: number
  name: string
  code: string
  logo?: string
  contact_name?: string
  contact_phone?: string
  address?: string
  status: 'active' | 'inactive' | 'suspended'
  max_elders: number
  max_users: number
  expires_at?: string
  created_at: string
  updated_at: string
}

// 用户类型
export interface User {
  id: number
  tenant_id?: number
  email: string
  name: string
  phone?: string
  avatar?: string
  role: UserRole
  status: 'active' | 'inactive' | 'locked'
  last_login_at?: string
  created_at: string
  updated_at: string
  // 关联数据
  tenant?: Tenant
}

// 会话用户信息（不含敏感数据）
export interface SessionUser {
  id: number
  tenant_id?: number
  email: string
  name: string
  role: UserRole
  tenant_name?: string
}

// 登录请求
export interface LoginRequest {
  email: string
  password: string
}

// 登录响应
export interface LoginResponse {
  user: SessionUser
  token?: string
}
