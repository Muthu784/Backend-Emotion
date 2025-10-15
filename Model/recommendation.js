import pool from "../utils/Database.js";

const ensureRecommendationsTableSql = `
CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion_id INTEGER REFERENCES emotions(id) ON DELETE CASCADE,
  recommendation_text TEXT NOT NULL,
  is_helpful BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export async function ensureRecommendationsTable() {
  await pool.query(ensureRecommendationsTableSql);
  console.log('Recommendations table ensured');
}

export async function createRecommendation(recommendationData) {
  const { user_id, emotion_id, recommendation_text } = recommendationData;
  const result = await pool.query(
    'INSERT INTO recommendations (user_id, emotion_id, recommendation_text) VALUES ($1, $2, $3) RETURNING *',
    [user_id, emotion_id, recommendation_text]
  );
  return result.rows[0];
}

export async function getRecommendationsByUserId(userId) {
  const result = await pool.query(
    'SELECT * FROM recommendations WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function updateRecommendationFeedback(id, isHelpful) {
  const result = await pool.query(
    'UPDATE recommendations SET is_helpful = $1 WHERE id = $2 RETURNING *',
    [isHelpful, id]
  );
  return result.rows[0];
}
