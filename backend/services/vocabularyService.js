const db = require('../config/db');

async function getAllVocabularies() {
  try {
    const [rows] = await db.query(
      'SELECT id, word, meaning, pronunciation, example, difficulty, created_at FROM vocabulary ORDER BY created_at DESC'
    );
    return rows;
  } catch (error) {
    console.error('vocabularyService getAllVocabularies error:', error);
    throw error;
  }
}

async function createVocabulary(vocab) {
  const { word, meaning, pronunciation, example, difficulty } = vocab;
  try {
    const [result] = await db.query(
      'INSERT INTO vocabulary (word, meaning, pronunciation, example, difficulty, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [word, meaning, pronunciation, example, difficulty || 'medium']
    );
    return {
      id: result.insertId,
      word,
      meaning,
      pronunciation,
      example,
      difficulty: difficulty || 'medium'
    };
  } catch (error) {
    console.error('vocabularyService createVocabulary error:', error);
    throw error;
  }
}

async function updateVocabulary(id, vocab) {
  const { word, meaning, pronunciation, example, difficulty } = vocab;
  try {
    await db.query(
      'UPDATE vocabulary SET word = ?, meaning = ?, pronunciation = ?, example = ?, difficulty = ? WHERE id = ?',
      [word, meaning, pronunciation, example, difficulty || 'medium', id]
    );
    return {
      id,
      word,
      meaning,
      pronunciation,
      example,
      difficulty: difficulty || 'medium'
    };
  } catch (error) {
    console.error('vocabularyService updateVocabulary error:', error);
    throw error;
  }
}

async function deleteVocabulary(id) {
  try {
    await db.query('DELETE FROM vocabulary WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('vocabularyService deleteVocabulary error:', error);
    throw error;
  }
}

module.exports = {
  getAllVocabularies,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary
};
