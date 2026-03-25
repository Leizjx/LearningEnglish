import React, { useState, useEffect } from 'react';
import Flashcard from '../components/Flashcard';
import { getAllVocabularies } from '../services/vocabularyService';
import './FlashcardsPage.css';

/**
 * Flashcards Practice Page
 * Displays a set of flashcards for learning vocabulary
 */
function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [markedCards, setMarkedCards] = useState(new Set());
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVocabularies = async () => {
      setLoading(true);
      try {
        const response = await getAllVocabularies();
        if (response.success) {
          const data = response.data;
          if (data && data.length > 0) {
            setFlashcards(data.map((item) => ({
              id: item.id,
              word: item.word,
              meaning: item.meaning,
              example: item.example || 'No example available.',
              pronunciation: item.pronunciation || ''
            })));
          } else {
            setFlashcards([...defaultFlashcards]);
          }
        } else {
          setFlashcards([...defaultFlashcards]);
        }
      } catch (fetchError) {
        console.error('Error fetching vocabularies:', fetchError);
        setFlashcards([...defaultFlashcards]);
      } finally {
        setLoading(false);
      }
    };

    loadVocabularies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultFlashcards = [
    {
      id: 1,
      word: 'Ambiguous',
      meaning: 'Open to more than one interpretation; unclearly expressed',
      example: 'The instructions were ambiguous and caused confusion.',
      pronunciation: 'æm-ˈbɪ-ɡjə-wəs'
    },
    {
      id: 2,
      word: 'Benevolent',
      meaning: 'Kind, generous, and thoughtful',
      example: 'The benevolent millionaire donated millions to charity.',
      pronunciation: 'bə-ˈne-və-lənt'
    },
    {
      id: 3,
      word: 'Eloquent',
      meaning: 'Fluent, persuasive, and expressive in speaking or writing',
      example: 'The speaker gave an eloquent speech that moved the audience.',
      pronunciation: 'ˈe-lə-kwənt'
    },
    {
      id: 4,
      word: 'Ephemeral',
      meaning: 'Lasting for a very short time; transitory',
      example: 'Trends on social media are often ephemeral.',
      pronunciation: 'i-ˈfe-mə-rəl'
    },
    {
      id: 5,
      word: 'Gregarious',
      meaning: 'Fond of being in company with others; living in groups',
      example: 'Humans are gregarious creatures who need social interaction.',
      pronunciation: 'ɡrə-ˈɡer-ē-əs'
    },
    {
      id: 6,
      word: 'Pragmatic',
      meaning: 'Dealing with things in a practical, realistic way based on actual circumstances',
      example: 'We need to take a pragmatic approach to solving this problem.',
      pronunciation: 'præɡ-ˈmæ-tɪk'
    },
    {
      id: 7,
      word: 'Rhetoric',
      meaning: 'The art of effective or persuasive speaking and writing',
      example: 'Political speech often relies heavily on rhetoric rather than facts.',
      pronunciation: 'ˈre-tə-rik'
    },
    {
      id: 8,
      word: 'Serendipity',
      meaning: 'The occurrence of events by chance in a happy or beneficial way',
      example: 'Meeting my best friend was pure serendipity.',
      pronunciation: 'ˌser-ən-ˈdɪ-pə-tē'
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < flashcards.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  const handleToggleMark = () => {
    const newMarked = new Set(markedCards);
    const cardId = flashcards[currentIndex].id;

    if (newMarked.has(cardId)) {
      newMarked.delete(cardId);
    } else {
      newMarked.add(cardId);
    }
    setMarkedCards(newMarked);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setMarkedCards(new Set());
  };

  if (loading) {
    return <div className="flashcards-page"><div className="loading" style={{textAlign: 'center', padding: '50px'}}>Đang tải dữ liệu, vui lòng đợi...</div></div>;
  }

  if (flashcards.length === 0) {
    return <div className="flashcards-page"><div className="no-data" style={{textAlign: 'center', padding: '50px'}}>Chưa có từ vựng nào để học.</div></div>;
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const isMarked = currentCard ? markedCards.has(currentCard.id) : false;

  return (
    <div className="flashcards-page">
      <div className="flashcards-container">
        <h1>English Vocabulary Practice</h1>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-info">
            <span>
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <span className="progress-percentage">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard Display */}
        <div className="flashcard-display">
          <Flashcard
            word={currentCard.word}
            meaning={currentCard.meaning}
            example={currentCard.example}
            pronunciation={currentCard.pronunciation}
          />
          {isMarked && <div className="marked-badge">✓ Marked</div>}
        </div>

        {/* Controls */}
        <div className="controls">
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          <button
            className={`btn btn-mark ${isMarked ? 'marked' : ''}`}
            onClick={handleToggleMark}
            title={isMarked ? 'Unmark this card' : 'Mark this card for review'}
          >
            {isMarked ? '★ Marked' : '☆ Mark'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next →
          </button>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-outline"
            onClick={handleReset}
          >
            Reset Progress
          </button>

          <div className="stats">
            <span>Marked: {markedCards.size}</span>
            <span className="divider">•</span>
            <span>Total: {flashcards.length}</span>
          </div>
        </div>

        {/* Mini Grid View */}
        <div className="mini-grid">
          <h3>All Cards</h3>
          <div className="card-buttons">
            {flashcards.map((card, index) => (
              <button
                key={card.id}
                className={`card-btn ${index === currentIndex ? 'active' : ''} ${
                  markedCards.has(card.id) ? 'marked' : ''
                }`}
                onClick={() => setCurrentIndex(index)}
                title={card.word}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlashcardsPage;
