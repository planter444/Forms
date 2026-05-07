import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const useSsl = process.env.DATABASE_SSL === "true";

export const databaseState = {
  ready: false,
  lastError: "Database has not connected yet."
};

const createPoolConfig = () => {
  if (process.env.DATABASE_URL) {
    try {
      const databaseUrl = new URL(process.env.DATABASE_URL);

      return {
        host: databaseUrl.hostname || process.env.DB_HOST || "localhost",
        port: Number(databaseUrl.port || process.env.DB_PORT || 5432),
        database: databaseUrl.pathname.replace(/^\//, "") || process.env.DB_NAME || "kerea_listings",
        user: decodeURIComponent(databaseUrl.username || process.env.DB_USER || "postgres"),
        password: `${process.env.DB_PASSWORD ?? decodeURIComponent(databaseUrl.password || "")}`,
        ssl: useSsl
          ? {
              rejectUnauthorized: false
            }
          : false
      };
    } catch {
      return {
        connectionString: process.env.DATABASE_URL,
        password: `${process.env.DB_PASSWORD ?? ""}`,
        ssl: useSsl
          ? {
              rejectUnauthorized: false
            }
          : false
      };
    }
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || "kerea_listings",
    user: process.env.DB_USER || "postgres",
    password: `${process.env.DB_PASSWORD ?? ""}`,
    ssl: useSsl
      ? {
          rejectUnauthorized: false
        }
      : false
  };
};

export const pool = new Pool(createPoolConfig());

export const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL,
        consent BOOLEAN NOT NULL,
        full_name TEXT,
        phone_number TEXT,
        category TEXT,
        categories TEXT[] DEFAULT '{}',
        license_number TEXT,
        license_body TEXT,
        county TEXT,
        coverage_mode TEXT,
        coverage_details TEXT,
        decline_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';
    `);

    await pool.query(`
      ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS coverage_mode TEXT;
    `);

    await pool.query(`
      ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS coverage_details TEXT;
    `);

    await pool.query(`
      ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS license_body TEXT;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        settings JSONB NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_email_key;`);
    await pool.query(`DROP INDEX IF EXISTS submissions_phone_number_unique;`);
    await pool.query(`CREATE INDEX IF NOT EXISTS submissions_email_index ON submissions (email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS submissions_phone_number_index ON submissions (phone_number);`);

    databaseState.ready = true;
    databaseState.lastError = "";
  } catch (error) {
    if (error?.message?.includes("client password must be a string")) {
      markDatabaseUnavailable(
        new Error("Database password is missing. Set DB_PASSWORD or include a password in DATABASE_URL.")
      );
      return;
    }

    markDatabaseUnavailable(error);
  }
};

export const markDatabaseUnavailable = (error) => {
  databaseState.ready = false;
  databaseState.lastError = error?.message || "Unknown database connection error.";
};
