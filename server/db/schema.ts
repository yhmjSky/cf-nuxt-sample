import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// =============================================
// 租户表（养老院）
// =============================================
export const tenants = sqliteTable('tenants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  logo: text('logo'),
  contact_name: text('contact_name'),
  contact_phone: text('contact_phone'),
  address: text('address'),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active'),
  max_elders: integer('max_elders').default(100),
  max_users: integer('max_users').default(20),
  expires_at: text('expires_at'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// =============================================
// 用户表
// =============================================
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant_id: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  avatar: text('avatar'),
  role: text('role', { enum: ['super_admin', 'tenant_admin', 'staff', 'caregiver'] }).notNull(),
  status: text('status', { enum: ['active', 'inactive', 'locked'] }).default('active'),
  last_login_at: text('last_login_at'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// =============================================
// 老人表
// =============================================
export const elders = sqliteTable('elders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant_id: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender', { enum: ['男', '女'] }),
  phone: text('phone'),
  address: text('address'),
  health_status: text('health_status', { enum: ['健康', '良好', '需关注'] }).default('健康'),
  emergency_contact: text('emergency_contact'),
  emergency_phone: text('emergency_phone'),
  notes: text('notes'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// =============================================
// 服务类型表
// =============================================
export const serviceTypes = sqliteTable('service_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant_id: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  is_system: integer('is_system', { mode: 'boolean' }).default(false),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
})

// =============================================
// 服务记录表
// =============================================
export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant_id: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  elder_id: integer('elder_id').notNull().references(() => elders.id, { onDelete: 'cascade' }),
  service_type_id: integer('service_type_id').references(() => serviceTypes.id),
  service_type: text('service_type').notNull(),
  service_date: text('service_date'),
  staff_name: text('staff_name'),
  description: text('description'),
  status: text('status', { enum: ['待处理', '进行中', '已完成', '已取消'] }).default('待处理'),
  created_by: integer('created_by').references(() => users.id),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP'),
})

// =============================================
// 关系定义
// =============================================
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  elders: many(elders),
  services: many(services),
  serviceTypes: many(serviceTypes),
}))

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenant_id],
    references: [tenants.id],
  }),
}))

export const eldersRelations = relations(elders, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [elders.tenant_id],
    references: [tenants.id],
  }),
  services: many(services),
}))

export const servicesRelations = relations(services, ({ one }) => ({
  tenant: one(tenants, {
    fields: [services.tenant_id],
    references: [tenants.id],
  }),
  elder: one(elders, {
    fields: [services.elder_id],
    references: [elders.id],
  }),
  serviceType: one(serviceTypes, {
    fields: [services.service_type_id],
    references: [serviceTypes.id],
  }),
  createdByUser: one(users, {
    fields: [services.created_by],
    references: [users.id],
  }),
}))

// =============================================
// 类型导出
// =============================================
export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Elder = typeof elders.$inferSelect
export type NewElder = typeof elders.$inferInsert
export type ServiceType = typeof serviceTypes.$inferSelect
export type NewServiceType = typeof serviceTypes.$inferInsert
export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert
