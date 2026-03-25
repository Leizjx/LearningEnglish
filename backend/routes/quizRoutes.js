const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', quizController.getAllQuizzes);
router.get('/:id', quizController.getQuiz);

// Protected routes (require authentication)
router.post('/custom', verifyToken, quizController.createCustomQuiz);
router.post('/:id/submit', verifyToken, quizController.submitQuiz);
router.get('/user/progress/all', verifyToken, quizController.getUserProgress);
router.get('/attempt/:attemptId', verifyToken, quizController.getAttemptDetails);

module.exports = router;
