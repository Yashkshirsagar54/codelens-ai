import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists (support writable /tmp in Vercel/serverless environments)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dataDir = isServerless ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'codelens.db');
let sqlite: Database.Database;
try {
  sqlite = new Database(dbPath);
  try { sqlite.pragma('journal_mode = WAL'); } catch {}
  try { sqlite.pragma('foreign_keys = ON'); } catch {}
} catch {
  sqlite = new Database(':memory:');
}

// Initialize tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    phone TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'developer' NOT NULL,
    password_hash TEXT,
    login_count INTEGER DEFAULT 1 NOT NULL,
    last_login_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS auth_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    auth_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS otps (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    code TEXT NOT NULL,
    language TEXT,
    mode TEXT DEFAULT 'general',
    overall_score INTEGER NOT NULL,
    summary TEXT NOT NULL,
    issues TEXT NOT NULL,
    strengths TEXT NOT NULL,
    refactored_code TEXT,
    generated_tests TEXT,
    metrics TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS usage_counters (
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    request_count INTEGER DEFAULT 0 NOT NULL,
    PRIMARY KEY (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0 NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Safe runtime column migrations
try { sqlite.exec(`ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0 NOT NULL;`); } catch {}
try { sqlite.exec(`ALTER TABLE users ADD COLUMN phone TEXT;`); } catch {}
try { sqlite.exec(`ALTER TABLE otps ADD COLUMN email TEXT;`); } catch {}
try { sqlite.exec(`ALTER TABLE otps ADD COLUMN otp_hash TEXT;`); } catch {}
try { sqlite.exec(`ALTER TABLE otps ADD COLUMN attempts INTEGER DEFAULT 0 NOT NULL;`); } catch {}
try { sqlite.exec(`ALTER TABLE otps ADD COLUMN max_attempts INTEGER DEFAULT 5 NOT NULL;`); } catch {}
try { sqlite.exec(`ALTER TABLE otps ADD COLUMN resend_available_at TEXT;`); } catch {}
try {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
} catch {}

export interface UserRecord {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: string;
  passwordHash?: string | null;
  isVerified?: boolean;
  loginCount?: number;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface AuthLogRecord {
  id: string;
  userId: string;
  authType: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AnalysisDbRecord {
  id: string;
  userId: string;
  code: string;
  language?: string | null;
  mode?: string;
  overallScore: number;
  summary: string;
  issues: any[];
  strengths: string[];
  refactoredCode?: string | null;
  generatedTests?: string | null;
  metrics?: any;
  createdAt: string;
}

export const sqliteService = {
  // --- USER OPERATIONS ---
  createUser(user: {
    id: string;
    email?: string;
    phone?: string;
    fullName?: string;
    avatarUrl?: string;
    role?: string;
    passwordHash?: string;
  }): UserRecord {
    const now = new Date().toISOString();
    const stmt = sqlite.prepare(`
      INSERT INTO users (id, email, phone, full_name, avatar_url, role, password_hash, login_count, last_login_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        phone = COALESCE(excluded.phone, users.phone),
        full_name = COALESCE(excluded.full_name, users.full_name),
        last_login_at = excluded.last_login_at
    `);
    stmt.run(
      user.id,
      user.email || null,
      user.phone || null,
      user.fullName || null,
      user.avatarUrl || null,
      user.role || 'developer',
      user.passwordHash || null,
      now,
      now
    );

    return this.getUserById(user.id)!;
  },

  getUserById(id: string): UserRecord | null {
    const row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      role: row.role,
      passwordHash: row.password_hash,
      isVerified: row.is_verified === 1 || row.is_verified === true,
      loginCount: row.login_count,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
    };
  },

  getUserByEmail(email: string): UserRecord | null {
    const row = sqlite.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim()) as any;
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      role: row.role,
      passwordHash: row.password_hash,
      isVerified: row.is_verified === 1 || row.is_verified === true,
      loginCount: row.login_count,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
    };
  },

  getUserByPhone(phone: string): UserRecord | null {
    const row = sqlite.prepare('SELECT * FROM users WHERE phone = ?').get(phone.trim()) as any;
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      role: row.role,
      passwordHash: row.password_hash,
      isVerified: row.is_verified === 1 || row.is_verified === true,
      loginCount: row.login_count,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
    };
  },

  markUserVerified(userId: string): void {
    sqlite.prepare('UPDATE users SET is_verified = 1 WHERE id = ?').run(userId);
  },

  updateUserLogin(userId: string): void {
    const now = new Date().toISOString();
    sqlite.prepare(`
      UPDATE users 
      SET last_login_at = ?, login_count = login_count + 1 
      WHERE id = ?
    `).run(now, userId);
  },

  updateUserProfile(userId: string, updates: { fullName?: string; phone?: string; avatarUrl?: string }): UserRecord | null {
    const existing = this.getUserById(userId);
    if (!existing) return null;

    sqlite.prepare(`
      UPDATE users
      SET full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          avatar_url = COALESCE(?, avatar_url)
      WHERE id = ?
    `).run(
      updates.fullName !== undefined ? updates.fullName : null,
      updates.phone !== undefined ? updates.phone : null,
      updates.avatarUrl !== undefined ? updates.avatarUrl : null,
      userId
    );

    return this.getUserById(userId);
  },

  getAllUsers(): UserRecord[] {
    const rows = sqlite.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[];
    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      phone: row.phone,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      role: row.role,
      passwordHash: row.password_hash,
      isVerified: row.is_verified === 1 || row.is_verified === true,
      loginCount: row.login_count,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
    }));
  },

  // --- AUTH LOGS ---
  recordAuthLog(log: { id: string; userId: string; authType: string; ipAddress?: string; userAgent?: string }): void {
    const now = new Date().toISOString();
    sqlite.prepare(`
      INSERT INTO auth_logs (id, user_id, auth_type, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      log.id,
      log.userId,
      log.authType,
      log.ipAddress || null,
      log.userAgent || null,
      now
    );
  },

  getRecentAuthLogs(limit: number = 50): AuthLogRecord[] {
    const rows = sqlite.prepare(`
      SELECT auth_logs.*, users.full_name, users.email 
      FROM auth_logs 
      LEFT JOIN users ON auth_logs.user_id = users.id 
      ORDER BY auth_logs.created_at DESC 
      LIMIT ?
    `).all(limit) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      authType: r.auth_type,
      ipAddress: r.ip_address,
      userAgent: r.user_agent,
      createdAt: r.created_at,
      userName: r.full_name,
      userEmail: r.email,
    }));
  },

  // --- OTP OPERATIONS ---
  saveOtp(id: string, phone: string, otp: string, expiresAtMs: number): void {
    const now = new Date().toISOString();
    const expiresAt = new Date(expiresAtMs).toISOString();
    // Clear previous OTPs for this phone
    sqlite.prepare('DELETE FROM otps WHERE phone = ?').run(phone);
    sqlite.prepare(`
      INSERT INTO otps (id, phone, otp, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, phone, otp, expiresAt, now);
  },

  getValidOtp(phone: string): { otp: string; expiresAt: number } | null {
    const row = sqlite.prepare('SELECT * FROM otps WHERE phone = ? ORDER BY created_at DESC LIMIT 1').get(phone) as any;
    if (!row) return null;
    const expiresAt = new Date(row.expires_at).getTime();
    if (Date.now() > expiresAt) {
      sqlite.prepare('DELETE FROM otps WHERE phone = ?').run(phone);
      return null;
    }
    return { otp: row.otp, expiresAt };
  },

  deleteOtp(phone: string): void {
    sqlite.prepare('DELETE FROM otps WHERE phone = ?').run(phone);
  },

  // --- EMAIL OTP OPERATIONS (Production-Ready) ---
  saveEmailOtp(id: string, email: string, otpHash: string, expiresAtMs: number, cooldownSeconds: number = 60): void {
    const cleanEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();
    const expiresAt = new Date(expiresAtMs).toISOString();
    const resendAvailableAt = new Date(Date.now() + cooldownSeconds * 1000).toISOString();

    // Invalidate any previous OTP for this email
    sqlite.prepare('DELETE FROM otps WHERE LOWER(email) = ? OR LOWER(phone) = ?').run(cleanEmail, cleanEmail);

    sqlite.prepare(`
      INSERT INTO otps (id, email, phone, otp, otp_hash, attempts, max_attempts, resend_available_at, expires_at, created_at)
      VALUES (?, ?, ?, '', ?, 0, 5, ?, ?, ?)
    `).run(id, cleanEmail, cleanEmail, otpHash, resendAvailableAt, expiresAt, now);
  },

  getEmailOtpRecord(email: string): {
    id: string;
    email: string;
    otpHash: string;
    attempts: number;
    maxAttempts: number;
    expiresAt: number;
    resendAvailableAt: number;
  } | null {
    const cleanEmail = email.toLowerCase().trim();
    const row = sqlite.prepare('SELECT * FROM otps WHERE LOWER(email) = ? OR LOWER(phone) = ? ORDER BY created_at DESC LIMIT 1').get(cleanEmail, cleanEmail) as any;
    if (!row) return null;

    const expiresAt = new Date(row.expires_at).getTime();
    const resendAvailableAt = row.resend_available_at ? new Date(row.resend_available_at).getTime() : 0;

    return {
      id: row.id,
      email: row.email || row.phone,
      otpHash: row.otp_hash || '',
      attempts: row.attempts || 0,
      maxAttempts: row.max_attempts || 5,
      expiresAt,
      resendAvailableAt,
    };
  },

  incrementOtpAttempts(id: string): number {
    sqlite.prepare('UPDATE otps SET attempts = attempts + 1 WHERE id = ?').run(id);
    const row = sqlite.prepare('SELECT attempts FROM otps WHERE id = ?').get(id) as any;
    return row ? row.attempts : 1;
  },

  deleteEmailOtp(email: string): void {
    const cleanEmail = email.toLowerCase().trim();
    sqlite.prepare('DELETE FROM otps WHERE LOWER(email) = ? OR LOWER(phone) = ?').run(cleanEmail, cleanEmail);
  },

  canResendEmailOtp(email: string): { allowed: boolean; waitSeconds: number } {
    const record = this.getEmailOtpRecord(email);
    if (!record) return { allowed: true, waitSeconds: 0 };
    const now = Date.now();
    if (now < record.resendAvailableAt) {
      const waitSeconds = Math.ceil((record.resendAvailableAt - now) / 1000);
      return { allowed: false, waitSeconds };
    }
    return { allowed: true, waitSeconds: 0 };
  },

  // --- MOBILE PHONE OTP OPERATIONS ---
  savePhoneOtp(id: string, phone: string, otpHash: string, expiresAtMs: number, resendCooldownSeconds: number = 60): void {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').trim();
    const expiresAt = new Date(expiresAtMs).toISOString();
    const resendAvailableAt = new Date(Date.now() + resendCooldownSeconds * 1000).toISOString();
    const now = new Date().toISOString();

    // Clear any previous OTPs for this phone number
    sqlite.prepare('DELETE FROM otps WHERE phone = ? OR email = ?').run(cleanPhone, cleanPhone);

    sqlite.prepare(`
      INSERT INTO otps (id, phone, otp, otp_hash, attempts, max_attempts, expires_at, resend_available_at, created_at)
      VALUES (?, ?, '', ?, 0, 5, ?, ?, ?)
    `).run(id, cleanPhone, otpHash, expiresAt, resendAvailableAt, now);
  },

  getPhoneOtpRecord(phone: string): {
    id: string;
    phone: string;
    otpHash: string;
    attempts: number;
    maxAttempts: number;
    expiresAt: number;
    resendAvailableAt: number;
  } | null {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').trim();
    const row = sqlite.prepare('SELECT * FROM otps WHERE phone = ? OR email = ? ORDER BY created_at DESC LIMIT 1').get(cleanPhone, cleanPhone) as any;
    if (!row) return null;

    const expiresAt = new Date(row.expires_at).getTime();
    const resendAvailableAt = row.resend_available_at ? new Date(row.resend_available_at).getTime() : 0;

    return {
      id: row.id,
      phone: row.phone || row.email,
      otpHash: row.otp_hash || '',
      attempts: row.attempts || 0,
      maxAttempts: row.max_attempts || 5,
      expiresAt,
      resendAvailableAt,
    };
  },

  deletePhoneOtp(phone: string): void {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').trim();
    sqlite.prepare('DELETE FROM otps WHERE phone = ? OR email = ?').run(cleanPhone, cleanPhone);
  },

  canResendPhoneOtp(phone: string): { allowed: boolean; waitSeconds: number } {
    const record = this.getPhoneOtpRecord(phone);
    if (!record) return { allowed: true, waitSeconds: 0 };
    const now = Date.now();
    if (now < record.resendAvailableAt) {
      const waitSeconds = Math.ceil((record.resendAvailableAt - now) / 1000);
      return { allowed: false, waitSeconds };
    }
    return { allowed: true, waitSeconds: 0 };
  },

  // --- PASSWORD RESET OPERATIONS ---
  createPasswordReset(id: string, userId: string, tokenHash: string, expiresAtMs: number): void {
    const expiresAt = new Date(expiresAtMs).toISOString();
    const now = new Date().toISOString();

    // Invalidate existing unused tokens for this user
    sqlite.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0').run(userId);

    sqlite.prepare(`
      INSERT INTO password_resets (id, user_id, token_hash, expires_at, used, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(id, userId, tokenHash, expiresAt, now);
  },

  getPasswordResetRecord(tokenHash: string): {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: number;
    used: boolean;
  } | null {
    const row = sqlite.prepare('SELECT * FROM password_resets WHERE token_hash = ? ORDER BY created_at DESC LIMIT 1').get(tokenHash) as any;
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at).getTime(),
      used: Boolean(row.used),
    };
  },

  markPasswordResetUsed(tokenHash: string): void {
    sqlite.prepare('UPDATE password_resets SET used = 1 WHERE token_hash = ?').run(tokenHash);
  },

  updateUserPassword(userId: string, passwordHash: string): void {
    sqlite.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
  },

  // --- ANALYSIS OPERATIONS ---
  saveAnalysis(analysis: AnalysisDbRecord): void {
    const now = analysis.createdAt || new Date().toISOString();
    sqlite.prepare(`
      INSERT INTO analyses (id, user_id, code, language, mode, overall_score, summary, issues, strengths, refactored_code, generated_tests, metrics, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        overall_score = excluded.overall_score,
        summary = excluded.summary,
        issues = excluded.issues,
        strengths = excluded.strengths,
        refactored_code = excluded.refactored_code,
        generated_tests = excluded.generated_tests,
        metrics = excluded.metrics
    `).run(
      analysis.id,
      analysis.userId,
      analysis.code,
      analysis.language || 'auto',
      analysis.mode || 'general',
      analysis.overallScore,
      analysis.summary,
      JSON.stringify(analysis.issues || []),
      JSON.stringify(analysis.strengths || []),
      analysis.refactoredCode || null,
      analysis.generatedTests || null,
      analysis.metrics ? JSON.stringify(analysis.metrics) : null,
      now
    );
  },

  getAnalyses(userId: string, limit: number = 20, offset: number = 0): { items: AnalysisDbRecord[]; total: number } {
    const totalRow = sqlite.prepare('SELECT COUNT(*) as count FROM analyses WHERE user_id = ?').get(userId) as any;
    const total = totalRow?.count || 0;

    const rows = sqlite.prepare(`
      SELECT * FROM analyses 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset) as any[];

    const items = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      code: r.code,
      language: r.language,
      mode: r.mode,
      overallScore: r.overall_score,
      summary: r.summary,
      issues: JSON.parse(r.issues || '[]'),
      strengths: JSON.parse(r.strengths || '[]'),
      refactoredCode: r.refactored_code,
      generatedTests: r.generated_tests,
      metrics: r.metrics ? JSON.parse(r.metrics) : undefined,
      createdAt: r.created_at,
    }));

    return { items, total };
  },

  deleteAnalysis(id: string, userId: string): boolean {
    const res = sqlite.prepare('DELETE FROM analyses WHERE id = ? AND user_id = ?').run(id, userId);
    return res.changes > 0;
  },

  // --- STATS ---
  getStats(): { totalUsers: number; totalLogins: number; totalAnalyses: number; recentUsers: UserRecord[] } {
    const userCount = (sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
    const loginCount = (sqlite.prepare('SELECT COUNT(*) as count FROM auth_logs').get() as any)?.count || 0;
    const analysisCount = (sqlite.prepare('SELECT COUNT(*) as count FROM analyses').get() as any)?.count || 0;
    const recentUsers = this.getAllUsers().slice(0, 10);

    return {
      totalUsers: userCount,
      totalLogins: loginCount,
      totalAnalyses: analysisCount,
      recentUsers,
    };
  },
};
