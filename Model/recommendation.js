import pool from "../utils/Database.js";

// Create tables for recommendations system
const ensureRecommendationsTablesSql = `
-- Emotions table (if not exists)
CREATE TABLE IF NOT EXISTS emotions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendation types table
CREATE TABLE IF NOT EXISTS recommendation_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion_id INTEGER REFERENCES emotions(id) ON DELETE CASCADE,
  type_id INTEGER REFERENCES recommendation_types(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT,
  tags TEXT[],
  is_helpful BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default recommendation types if not exists
INSERT INTO recommendation_types (name)
VALUES 
  ('music'),
  ('book'),
  ('movie')
ON CONFLICT (name) DO NOTHING;

-- Insert default emotions if not exists
INSERT INTO emotions (name)
VALUES 
  ('joy'),
  ('sadness'),
  ('anger'),
  ('fear'),
  ('love'),
  ('surprise')
ON CONFLICT (name) DO NOTHING;
`;

export async function ensureRecommendationsTables() {
  try {
    await pool.query(ensureRecommendationsTablesSql);
    console.log('Recommendations tables and default data ensured');
  } catch (error) {
    console.error('Error ensuring recommendations tables:', error);
    throw error;
  }
}

export async function createRecommendation({
  user_id,
  emotion,
  type,
  title,
  description = null,
  url = null,
  tags = []
}) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get emotion_id and type_id
    const emotionResult = await client.query(
      'SELECT id FROM emotions WHERE name = $1',
      [emotion.toLowerCase()]
    );
    
    const typeResult = await client.query(
      'SELECT id FROM recommendation_types WHERE name = $1',
      [type.toLowerCase()]
    );

    if (!emotionResult.rows[0] || !typeResult.rows[0]) {
      throw new Error('Invalid emotion or recommendation type');
    }

    const result = await client.query(
      `INSERT INTO recommendations 
        (user_id, emotion_id, type_id, title, description, url, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        user_id,
        emotionResult.rows[0].id,
        typeResult.rows[0].id,
        title,
        description,
        url,
        tags
      ]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getRecommendations(emotion, types = null) {
  try {
    let query = `
      SELECT 
        r.*,
        e.name as emotion,
        rt.name as type
      FROM recommendations r
      JOIN emotions e ON r.emotion_id = e.id
      JOIN recommendation_types rt ON r.type_id = rt.id
      WHERE e.name = $1
    `;
    
    const params = [emotion.toLowerCase()];
    
    if (types && types.length > 0) {
      query += ` AND rt.name = ANY($2::text[])`;
      params.push(types);
    }
    
    query += ` ORDER BY r.created_at DESC`;
    
    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      url: row.url,
      tags: row.tags,
      emotion: row.emotion,
      is_helpful: row.is_helpful,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

export async function getRecommendationsByUserId(userId) {
  try {
    const result = await pool.query(
      `SELECT 
        r.*,
        e.name as emotion,
        rt.name as type
      FROM recommendations r
      JOIN emotions e ON r.emotion_id = e.id
      JOIN recommendation_types rt ON r.type_id = rt.id
      WHERE r.user_id = $1 
      ORDER BY r.created_at DESC`,
      [userId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      url: row.url,
      tags: row.tags,
      emotion: row.emotion,
      is_helpful: row.is_helpful,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error getting user recommendations:', error);
    throw error;
  }
}

export async function updateRecommendationFeedback(id, isHelpful) {
  try {
    const result = await pool.query(
      'UPDATE recommendations SET is_helpful = $1 WHERE id = $2 RETURNING *',
      [isHelpful, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating recommendation feedback:', error);
    throw error;
  }
}

export async function getRecommendationsByEmotion(emotion) {
  try {
    const result = await pool.query(
      `SELECT 
        r.*,
        e.name as emotion,
        rt.name as type
      FROM recommendations r
      JOIN emotions e ON r.emotion_id = e.id
      JOIN recommendation_types rt ON r.type_id = rt.id
      WHERE e.name = $1
      ORDER BY r.created_at DESC`,
      [emotion.toLowerCase()]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      url: row.url,
      tags: row.tags,
      emotion: row.emotion,
      is_helpful: row.is_helpful,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error getting recommendations by emotion:', error);
    throw error;
  }
}

// Add some helper functions for managing emotions and types
export async function getAllEmotions() {
  const result = await pool.query('SELECT * FROM emotions ORDER BY name');
  return result.rows;
}

export async function getAllRecommendationTypes() {
  const result = await pool.query('SELECT * FROM recommendation_types ORDER BY name');
  return result.rows;
}