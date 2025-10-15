import pool from "../utils/Database.js";

const ensureChatMessagesTableSql = `
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  emotion VARCHAR(100),
  is_user BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

export async function ensureChatMessagesTable() {
  await pool.query(ensureChatMessagesTableSql);
}

export async function createChatMessage(messageData) {
  const { user_id, content, emotion, is_user } = messageData;
  const result = await pool.query(
    "INSERT INTO chat_messages (user_id, content, emotion, is_user) VALUES ($1, $2, $3, $4) RETURNING *",
    [user_id, content, emotion, is_user]
  );
  return result.rows[0];
}

export async function getChatMessagesByUserId(userId) {
  const result = await pool.query(
    "SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY timestamp ASC",
    [userId]
  );
  return result.rows;
}

export async function getChatMessageById(id) {
  const result = await pool.query(
    "SELECT * FROM chat_messages WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}