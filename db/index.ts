import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';
import { sqliteService } from './sqliteStore';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL is not set in environment variables.');
}

// -----------------------------------------------------------------------------
// SERVERLESS CONNECTION CONFIGURATION
// For Vercel Serverless Functions + Supabase (PgBouncer / Transaction pooler on port 6543),
// `prepare: false` is REQUIRED because connection poolers in transaction mode
// do not support prepared statements across dynamic function instances.
// -----------------------------------------------------------------------------
let client: any = null;
let dbInstance: any = null;

try {
  if (connectionString) {
    client = postgres(connectionString, {
      prepare: false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    dbInstance = drizzle(client, { schema });
  }
} catch (e: any) {
  console.warn('⚠️ Direct postgres pool init note:', e.message);
}

export const db = dbInstance || ({} as any);
export type DbClient = typeof db;

// Export resilient unified dbService for user, auth, and analysis operations
export { sqliteService as dbService };
export * from './sqliteStore';

