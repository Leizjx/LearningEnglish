import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../services/quizService';
import '../pages/QuizTakingPage.css';

const QuizTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.time_limit && !submitted) {
      setTimeLeft(quiz.time_limit * 60);
    }
  }, [quiz, submitted]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await getQuiz(quizId);
      if (response.success) {
        setQuiz(response.data);
      }
      setError('');
    } catch (err) {
      console.error('Error loading quiz:', err);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      // Convert answers format
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId: parseInt(questionId),
        selectedOptionId: selectedOptionId
      }));

      const response = await submitQuiz(quizId, formattedAnswers);
      if (response.success) {
        setSubmitted(true);
        navigate(`/quiz-results/${response.data.attemptId}`);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="quiz-taking-container">
        <div className="loading">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="quiz-taking-container">
        <div className="error-message">Quiz not found or has no questions</div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <div className="quiz-taking-container">
      <div className="quiz-content">
        {/* Header */}
        <div className="quiz-top-bar">
          <div className="quiz-title">
            <h2>{quiz.title}</h2>
          </div>
          <div className="quiz-stats">
            <div className="stat">
              <span className="stat-label">Question</span>
              <span className="stat-value">{currentQuestionIndex + 1}/{quiz.questions.length}</span>
            </div>
            {quiz.time_limit && (
              <div className="stat">
                <span className="stat-label">Time Left</span>
                <span className={`stat-value ${timeLeft < 300 ? 'warning' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{Math.round(progress)}% Complete</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Question */}
        <div className="question-section">
          <h3 className="question-text">{currentQuestion.question_text}</h3>

          {/* Options */}
          <div className="options-container">
            {currentQuestion.options.map((option) => (
              <label key={option.id} className="option-label">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.id}
                  checked={answers[currentQuestion.id] === option.id}
                  onChange={() => handleSelectAnswer(currentQuestion.id, option.id)}
                  className="option-input"
                />
                <span className={`option-text ${answers[currentQuestion.id] === option.id ? 'selected' : ''}`}>
                  {option.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="navigation-section">
          <button
            className="btn-nav"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </button>

          <div className="question-indicators">
            {quiz.questions.map((q, idx) => (
              <button
                key={q.id}
                className={`indicator ${idx === currentQuestionIndex ? 'current' : ''} ${answers[q.id] !== undefined ? 'answered' : ''}`}
                onClick={() => setCurrentQuestionIndex(idx)}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <button
              className="btn-submit"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length === 0}
            >
              Submit Quiz
            </button>
          ) : (
            <button
              className="btn-nav"
              onClick={handleNext}
              disabled={currentQuestionIndex === quiz.questions.length - 1}
            >
              Next →
            </button>
          )}
        </div>

        {/* Answered Info */}
        <div className="answered-info">
          {isAnswered && <span className="badge-answered">✓ Answered</span>}
          <span className="badge-info">
            {Object.keys(answers).length}/{quiz.questions.length} answered
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuizTakingPage;
