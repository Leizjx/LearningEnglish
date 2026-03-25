const vocabularyService = require('../services/vocabularyService');

async function getAllVocabularies(req, res) {
  try {
    const vocabs = await vocabularyService.getAllVocabularies();
    return res.json({ success: true, data: vocabs });
  } catch (error) {
    console.error('vocabularyController getAllVocabularies error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vocabularies' });
  }
}

async function createVocabulary(req, res) {
  try {
    const { word, meaning, pronunciation, example, difficulty } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ success: false, message: 'Word and meaning are required' });
    }

    const vocab = await vocabularyService.createVocabulary({ word, meaning, pronunciation, example, difficulty });
    return res.status(201).json({ success: true, data: vocab });
  } catch (error) {
    console.error('vocabularyController createVocabulary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create vocabulary' });
  }
}

async function updateVocabulary(req, res) {
  try {
    const { id } = req.params;
    const { word, meaning, pronunciation, example, difficulty } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ success: false, message: 'Word and meaning are required' });
    }

    const vocab = await vocabularyService.updateVocabulary(id, { word, meaning, pronunciation, example, difficulty });
    return res.status(200).json({ success: true, data: vocab });
  } catch (error) {
    console.error('vocabularyController updateVocabulary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update vocabulary' });
  }
}

async function deleteVocabulary(req, res) {
  try {
    const { id } = req.params;
    await vocabularyService.deleteVocabulary(id);
    return res.status(200).json({ success: true, message: 'Vocabulary deleted successfully' });
  } catch (error) {
    console.error('vocabularyController deleteVocabulary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete vocabulary' });
  }
}

module.exports = {
  getAllVocabularies,
  createVocabulary,
  updateVocabulary,
  deleteVocabulary
};