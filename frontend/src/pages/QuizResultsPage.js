import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttemptDetails, getQuiz } from '../services/quizService';
import '../pages/QuizResultsPage.css';

const QuizResultsPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadAttemptDetails();
  }, [attemptId]);

  const loadAttemptDetails = async () => {
    try {
      setLoading(true);
      const response = await getAttemptDetails(attemptId);
      if (response.success) {
        setAttempt(response.data);
        // Load quiz details to show questions
        const quizResponse = await getQuiz(response.data.quiz_id);
        if (quizResponse.success) {
          setQuiz(quizResponse.data);
        }
      }
      setError('');
    } catch (err) {
      console.error('Error loading attempt details:', err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return '🌟 Outstanding!';
    if (score >= 80) return '✅ Excellent!';
    if (score >= 70) return '👍 Good Job!';
    if (score >= 60) return '📚 Keep Practicing!';
    return '💪 Try Again!';
  };

  if (loading) {
    return (
      <div className="results-container">
        <div className="loading">Loading results...</div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="results-container">
        <div className="error-message">{error || 'Results not found'}</div>
      </div>
    );
  }

  const scorePercent = Math.round(attempt.score);
  const answers = attempt.answers || [];
  const correctCount = answers.filter(a => a.isCorrect).length;

  return (
    <div className="results-container">
      <div className="results-card">
        {/* Score Display */}
        <div className="score-section">
          <div className="score-circle" style={{ borderColor: getScoreColor(scorePercent) }}>
            <div className="score-number" style={{ color: getScoreColor(scorePercent) }}>
              {scorePercent}%
            </div>
          </div>
          <h1 className="score-message">{getScoreMessage(scorePercent)}</h1>
          <p className="quiz-title">{attempt.quiz_title}</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <div className="stat-label">Correct Answers</div>
              <div className="stat-value">{correctCount}/{answers.length}</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-label">Score</div>
              <div className="stat-value">{scorePercent}%</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{new Date(attempt.completed_at).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">{Math.round((correctCount / answers.length) * 100)}%</div>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="performance-section">
          <h2>Performance Breakdown</h2>
          <div className="performance-bar">
            <div className="bar-segment correct" style={{ width: `${(correctCount / answers.length) * 100}%` }}>
              <span className="segment-label">{correctCount} Correct</span>
            </div>
            <div className="bar-segment wrong" style={{ width: `${((answers.length - correctCount) / answers.length) * 100}%` }}>
              <span className="segment-label">{answers.length - correctCount} Wrong</span>
            </div>
          </div>
        </div>

        {/* Detailed Review */}
        {quiz && (
          <div className="details-section">
            <button 
              className="btn-toggle-details"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '▼ Hide Review' : '▶ Show Detailed Review'}
            </button>

            {showDetails && (
              <div className="review-container">
                {quiz.questions && quiz.questions.map((question, idx) => {
                  const answer = answers.find(a => a.questionId === question.id);
                  return (
                    <div key={question.id} className="review-item">
                      <div className="review-header">
                        <span className="question-number">Question {idx + 1}</span>
                        {answer?.isCorrect ? (
                          <span className="badge correct">✓ Correct</span>
                        ) : (
                          <span className="badge wrong">✗ Wrong</span>
                        )}
                      </div>
                      <p className="review-question">{question.question_text}</p>
                      <div className="review-options">
                        {question.options && question.options.map((option) => {
                          const selectedThisOption = answer?.selectedOptionId === option.id;
                          const isCorrectOption = option.id === 
                            (quiz.questions.find(q => q.id === question.id)?.options.find(opt => opt.is_correct)?.id);
                          
                          return (
                            <div 
                              key={option.id} 
                              className={`review-option ${selectedThisOption ? 'selected' : ''} ${isCorrectOption ? 'correct-answer' : ''}`}
                            >
                              {selectedThisOption && <span className="marker">You selected: </span>}
                              {isCorrectOption && <span className="marker">✓ Correct: </span>}
                              {option.text}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn-retake"
            onClick={() => navigate(`/quiz-taking/${attempt.quiz_id}`)}
          >
            🔄 Retake Quiz
          </button>
          <button 
            className="btn-back"
            onClick={() => navigate('/quizzes')}
          >
            ← Back to Quizzes
          </button>
          <button 
            className="btn-dashboard"
            onClick={() => navigate('/dashboard')}
          >
            🏠 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
