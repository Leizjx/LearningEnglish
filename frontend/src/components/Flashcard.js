import React, { useState } from 'react';
import './Flashcard.css';

/**
 * Flashcard Component
 * Displays a word on front and meaning/translation on back
 * Clicks to flip between front and back
 * 
 * Props:
 *   - word (string): English word to display
 *   - meaning (string): Definition or translation
 *   - example (string, optional): Example sentence
 *   - pronunciation (string, optional): Pronunciation guide
 */
function Flashcard({ word, meaning, example, pronunciation }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flashcard-wrapper" onClick={handleFlip}>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Side */}
        <div className="flashcard-front">
          <div className="flashcard-content">
            <h2 className="flashcard-word">{word}</h2>
            {pronunciation && (
              <p className="flashcard-pronunciation">/{pronunciation}/</p>
            )}
            <p className="flashcard-hint">Click to reveal meaning</p>
          </div>
        </div>

        {/* Back Side */}
        <div className="flashcard-back">
          <div className="flashcard-content">
            <h3 className="flashcard-label">Meaning</h3>
            <p className="flashcard-meaning">{meaning}</p>
            {example && (
              <>
                <h4 className="flashcard-label">Example</h4>
                <p className="flashcard-example">"{example}"</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;
