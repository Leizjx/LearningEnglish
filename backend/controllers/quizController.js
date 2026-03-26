const quizService = require('../services/quizService');

// Get all quizzes
async function getAllQuizzes(req, res) {
  try {
    const quizzes = await quizService.getAllQuizzes();
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error in getAllQuizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
}

// Create Custom Quiz
async function createCustomQuiz(req, res) {
  try {
    const { title, description, vocabularies } = req.body;
    if (!title || !vocabularies || vocabularies.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu tiêu đề hoặc chưa có từ vựng nào.' });
    }
    const result = await quizService.createCustomQuiz(title, description, vocabularies);
    res.json(result);
  } catch (error) {
    console.error('Error in createCustomQuiz:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi tạo quiz' });
  }
}

// Get quiz with questions
async function getQuiz(req, res) {
  try {
    const { id } = req.params;
    const quiz = await quizService.getQuizWithQuestions(id);
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error in getQuiz:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Quiz not found'
    });
  }
}

// Submit quiz answers and get score
async function submitQuiz(req, res) {
  try {
    const { answers } = req.body;
    const userId = req.user.id;
    const { id } = req.params;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers format'
      });
    }
    
    const result = await quizService.saveQuizAttempt(userId, id, answers);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in submitQuiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
}

// Get user quiz progress
async function getUserProgress(req, res) {
  try {
    const userId = req.user.id;
    const progress = await quizService.getUserQuizProgress(userId);
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user progress',
      error: error.message
    });
  }
}

// Get attempt details
async function getAttemptDetails(req, res) {
  try {
    const userId = req.user.id;
    const { attemptId } = req.params;
    const attempt = await quizService.getAttemptDetails(userId, attemptId);
    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Error in getAttemptDetails:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Attempt not found'
    });
  }
}

// Delete Quiz
async function deleteQuiz(req, res) {
  try {
    const { id } = req.params;
    // Lưu ý: Trong thực tế nên kiểm tra xem quizId này có phải do user này tạo hay không
    // Hiện tại table quizzes chưa có trường creator_id nên ta cho phép xóa nếu có token.
    const result = await quizService.deleteQuiz(id);
    res.json(result);
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi khi xóa quiz' });
  }
}

module.exports = {
  getAllQuizzes,
  getQuizWithQuestions: getQuiz, // Renamed getQuiz to getQuizWithQuestions as per the instruction's module.exports
  submitQuiz,
  getUserProgress,
  getAttemptDetails,
  createCustomQuiz,
  deleteQuiz
};
