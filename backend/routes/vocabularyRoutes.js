const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const vocabularyController = require('../controllers/vocabularyController');

router.get('/', verifyToken, vocabularyController.getAllVocabularies);
router.post('/', verifyToken, vocabularyController.createVocabulary);
router.put('/:id', verifyToken, vocabularyController.updateVocabulary);
router.delete('/:id', verifyToken, vocabularyController.deleteVocabulary);

module.exports = router;
