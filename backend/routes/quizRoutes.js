const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken } = require('../middleware/authMiddleware');

// Routes
router.get('/', quizController.getAllQuizzes);
router.post('/custom', verifyToken, quizController.createCustomQuiz);
router.get('/user/progress/all', verifyToken, quizController.getUserProgress);
router.get('/attempt/:attemptId', verifyToken, quizController.getAttemptDetails);

// Routes with :id parameter (should be after more specific routes)
router.get('/:id', quizController.getQuiz);
router.post('/:id/submit', verifyToken, quizController.submitQuiz);
router.delete('/:id', verifyToken, quizController.deleteQuiz);

module.exports = router;
