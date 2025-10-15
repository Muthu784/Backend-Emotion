import pool from "../utils/Database.js";

const ensureEmotionsTableSql = `
CREATE TABLE IF NOT EXISTS emotions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion VARCHAR(100) NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  context TEXT,
  confidence DECIMAL(3,2),
  ai_analyzed BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export async function ensureEmotionsTable() {
  await pool.query(ensureEmotionsTableSql);
}

export async function createEmotion(emotionData) {
  const { user_id, emotion, intensity, context, confidence, ai_analyzed } = emotionData;
  const result = await pool.query(
    "INSERT INTO emotions (user_id, emotion, intensity, context, confidence, ai_analyzed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [user_id, emotion, intensity, context, confidence, ai_analyzed]
  );
  return result.rows[0];
}

export async function getEmotionsByUserId(userId) {
  const result = await pool.query(
    "SELECT * FROM emotions WHERE user_id = $1 ORDER BY timestamp DESC",
    [userId]
  );
  return result.rows;
}

export async function getEmotionById(id) {
  const result = await pool.query(
    "SELECT * FROM emotions WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function deleteEmotion(id, userId) {
  const result = await pool.query(
    "DELETE FROM emotions WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return result.rowCount > 0;
}