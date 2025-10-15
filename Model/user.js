import pool from "../utils/Database.js";

const ensureUsersTableSql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
`;

// SQL to alter table and add password column if it doesn't exist
const alterTableAddPasswordSql = `
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'password') THEN
        ALTER TABLE users ADD COLUMN password VARCHAR(255);
    END IF;
END $$;
`;

export async function ensureUsersTable() {
  try {
    // First create table if it doesn't exist
    await pool.query(ensureUsersTableSql);
    console.log('Users table ensured');
    
    // Then alter table to add password column if missing
    await pool.query(alterTableAddPasswordSql);
    console.log('Password column ensured');
  } catch (error) {
    console.error('Error ensuring users table:', error);
    throw error;
  }
}

export async function createUser(userData) {
  const { username, email, password } = userData;
  const result = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
    [username, email, password]
  );
  return result.rows[0];
}

export async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, username, email, password FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function getUsers() {
  const result = await pool.query(
    "SELECT id, username, email FROM users ORDER BY id DESC"
  );
  return result.rows;
}

export async function getUserByEmail(email) {
  const result = await pool.query(
    "SELECT id, username, email, password FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

export async function updateUser(id, { username, email, password }) {
  const result = await pool.query(
    "UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, username, email",
    [username, email, password, id]
  );
  return result.rows[0] || null;
}

export async function deleteUser(id) {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rowCount > 0;
}