import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllQuizzes, getUserQuizProgress } from '../services/quizService';
import VocabularyBuilder from '../components/VocabularyBuilder';
import '../pages/QuizzesPage.css';

const QuizzesPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    loadQuizzesAndProgress();
  }, []);

  const loadQuizzesAndProgress = async () => {
    try {
      setLoading(true);
      const [quizzesRes, progressRes] = await Promise.all([
        getAllQuizzes(),
        getUserQuizProgress()
      ]);

      if (quizzesRes.success) {
        setQuizzes(quizzesRes.data || []);
      }

      if (progressRes.success) {
        const progressMap = {};
        progressRes.data?.forEach(p => {
          progressMap[p.id] = p;
        });
        setUserProgress(progressMap);
      }

      setError('');
    } catch (err) {
      console.error('Error loading quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#27ae60',
      medium: '#f39c12',
      hard: '#e74c3c'
    };
    return colors[difficulty] || '#667eea';
  };

  const getDifficultyLabel = (difficulty) => {
    return difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'All Levels';
  };

  const filteredQuizzes = selectedDifficulty === 'all' 
    ? quizzes 
    : quizzes.filter(q => q.difficulty === selectedDifficulty);

  if (loading) {
    return (
      <div className="quizzes-container">
        <div className="loading">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="quizzes-container">
      <div className="quizzes-header">
        <h1>📝 Quiz Center</h1>
        <p>Test your English knowledge with our interactive quizzes</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <VocabularyBuilder />

      <div className="filters">
        <label htmlFor="difficulty">Filter by Difficulty:</label>
        <select 
          id="difficulty" 
          value={selectedDifficulty} 
          onChange={(e) => setSelectedDifficulty(e.target.value)}
        >
          <option value="all">All Levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="no-quizzes">
          <p>No quizzes available for the selected difficulty level.</p>
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map(quiz => {
            const progress = userProgress[quiz.id];
            const hasAttempted = progress && progress.attempts > 0;

            return (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-header">
                  <h3>{quiz.title}</h3>
                  <span 
                    className="difficulty-badge" 
                    style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                  >
                    {getDifficultyLabel(quiz.difficulty)}
                  </span>
                </div>

                <p className="quiz-description">{quiz.description}</p>

                <div className="quiz-info">
                  <div className="info-item">
                    <span className="label">Questions:</span>
                    <span className="value">{quiz.questionCount}</span>
                  </div>
                  {hasAttempted && (
                    <>
                      <div className="info-item">
                        <span className="label">Attempts:</span>
                        <span className="value">{progress.attempts}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Best Score:</span>
                        <span className="value score">{Math.round(progress.highestScore)}%</span>
                      </div>
                    </>
                  )}
                </div>

                {hasAttempted && (
                  <div className="progress-info">
                    <small>Last attempted: {new Date(progress.lastAttempted).toLocaleDateString()}</small>
                  </div>
                )}

                <button 
                  className="btn-start-quiz"
                  onClick={() => navigate(`/quiz-taking/${quiz.id}`)}
                >
                  {hasAttempted ? 'Retake Quiz' : 'Start Quiz'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
