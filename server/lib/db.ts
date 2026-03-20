import pg from "pg";
import bcryptjs from "bcryptjs";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

export const db = pool;

// Initialize database tables
export async function initializeDatabase() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        is_admin BOOLEAN DEFAULT false,
        verified BOOLEAN DEFAULT false,
        kyc_status VARCHAR(50) DEFAULT 'not_submitted',
        kyc_documents JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP,
        total_losses NUMERIC DEFAULT 0,
        jackpot_opt_in BOOLEAN DEFAULT false
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log("Database initialized successfully");

    // Create admin user if it doesn't exist
    await createAdminUserIfNeeded();
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

async function createAdminUserIfNeeded() {
  try {
    // Create first admin user
    const adminEmail1 = "ooinkrazy00@gmail.com";
    const adminPassword1 = "Woot6969!";

    const result1 = await db.query("SELECT id FROM users WHERE email = $1", [
      adminEmail1,
    ]);

    if (result1.rows.length === 0) {
      const hashedPassword = await bcryptjs.hash(adminPassword1, 10);
      await db.query(
        "INSERT INTO users (email, password_hash, name, is_admin, verified) VALUES ($1, $2, $3, $4, $5)",
        [adminEmail1, hashedPassword, "Admin", true, true],
      );
      console.log("Admin user created successfully:", adminEmail1);
    } else {
      console.log("Admin user already exists:", adminEmail1);
    }

    // Create second admin user
    const adminEmail2 = "coinkrazy26@gmail.com";
    const adminPassword2 = "admin123";

    const result2 = await db.query("SELECT id FROM users WHERE email = $1", [
      adminEmail2,
    ]);

    if (result2.rows.length === 0) {
      const hashedPassword = await bcryptjs.hash(adminPassword2, 10);
      await db.query(
        "INSERT INTO users (email, password_hash, name, is_admin, verified) VALUES ($1, $2, $3, $4, $5)",
        [adminEmail2, hashedPassword, "CoinKrazy Admin", true, true],
      );
      console.log("Admin user created successfully:", adminEmail2);
    } else {
      console.log("Admin user already exists:", adminEmail2);
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}
