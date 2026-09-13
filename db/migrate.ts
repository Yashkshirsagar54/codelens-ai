import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

// Use DIRECT_DATABASE_URL for migrations to bypass PgBouncer transaction pooling (port 5432)
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DIRECT_DATABASE_URL or DATABASE_URL environment variable is missing.');
  process.exit(1);
}

async function runMigrations() {
  console.log('🔄 Connecting directly to database for DDL migrations (bypassing PgBouncer)...');
  // Connection for DDL operations & migrations (prepare: false for pooler support)
  const sql = postgres(connectionString!, { max: 1, prepare: false });
  const db = drizzle(sql);

  try {
    console.log('🚀 Running database migrations from db/migrations...');
    await migrate(db, { migrationsFolder: './db/migrations' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
