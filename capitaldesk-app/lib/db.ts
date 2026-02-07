import { Pool, QueryResult, QueryResultRow } from "pg";

// Singleton connection pool
let pool: Pool | null = null;

/**
 * Get PostgreSQL connection pool (singleton)
 */
export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please configure it in .env.local"
      );
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return error if connection takes > 2s
    });

    // Log pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client", err);
    });

    console.log("✅ PostgreSQL connection pool created");
  }

  return pool;
}

/**
 * Execute a SQL query
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 100ms)
    if (duration > 100) {
      console.warn(`⚠️ Slow query (${duration}ms): ${text.substring(0, 100)}`);
    }

    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Close the connection pool (for testing/cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("✅ PostgreSQL connection pool closed");
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query("SELECT NOW() as current_time");
    console.log("✅ Database connection successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}
