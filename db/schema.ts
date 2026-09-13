import { pgTable, text, timestamp, integer, uuid, date, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';

// -----------------------------------------------------------------------------
// USERS TABLE
// Stores all registered developers, authentication metadata, and activity metrics.
// -----------------------------------------------------------------------------
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email'),
  phone: text('phone'),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: text('role').default('developer').notNull(),
  passwordHash: text('password_hash'),
  isVerified: integer('is_verified').default(0).notNull(),
  loginCount: integer('login_count').default(1).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// AUTH LOGS TABLE
// Tracks every registration, login, and OTP verification event with timestamps.
// -----------------------------------------------------------------------------
export const authLogs = pgTable('auth_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  authType: text('auth_type').notNull(), // 'register' | 'login' | 'otp' | 'demo' | 'oauth'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// OTPS TABLE
// Stores active generated 6-digit OTPs linked to contact emails and numbers
// -----------------------------------------------------------------------------
export const otps = pgTable('otps', {
  id: text('id').primaryKey(),
  email: text('email'),
  phone: text('phone'),
  otp: text('otp'),
  otpHash: text('otp_hash'),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(5).notNull(),
  resendAvailableAt: timestamp('resend_available_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// PASSWORD RESETS TABLE
// Stores secure 32-byte password reset tokens with expiration and single-use status
// -----------------------------------------------------------------------------
export const passwordResets = pgTable('password_resets', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  used: integer('used').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// ANALYSES TABLE
// Stores historical AI code review analyses linked to users.
// -----------------------------------------------------------------------------
export interface CodeIssue {
  severity: 'high' | 'medium' | 'low';
  line: number | null;
  title: string;
  description: string;
  suggestion: string;
}

export const analyses = pgTable('analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  language: text('language'),
  mode: text('mode').default('general'),
  overallScore: integer('overall_score').notNull(),
  summary: text('summary').notNull(),
  issues: jsonb('issues').$type<CodeIssue[]>().notNull(),
  strengths: jsonb('strengths').$type<string[]>().notNull(),
  refactoredCode: text('refactored_code'),
  generatedTests: text('generated_tests'),
  metrics: jsonb('metrics'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// -----------------------------------------------------------------------------
// USAGE COUNTERS TABLE
// Daily per-user analysis counter for rate limiting / free tier enforcement.
// -----------------------------------------------------------------------------
export const usageCounters = pgTable('usage_counters', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(), // Format: YYYY-MM-DD
  requestCount: integer('request_count').notNull().default(0),
}, (table) => ({
  userDateIdx: uniqueIndex('user_date_idx').on(table.userId, table.date),
}));

