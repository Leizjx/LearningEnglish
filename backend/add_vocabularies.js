const db = require('./config/db');

async function addSampleVocabularies() {
  try {
    console.log('Adding sample vocabulary data...');

    const vocabularies = [
      { word: 'Ambiguous', meaning: 'Open to more than one interpretation; unclearly expressed', pronunciation: 'æm-ˈbɪ-ɡjə-wəs', example: 'The instructions were ambiguous and caused confusion.', difficulty: 'medium' },
      { word: 'Benevolent', meaning: 'Kind, generous, and thoughtful', pronunciation: 'bə-ˈne-və-lənt', example: 'The benevolent millionaire donated millions to charity.', difficulty: 'easy' },
      { word: 'Eloquent', meaning: 'Fluent, persuasive, and expressive in speaking or writing', pronunciation: 'ˈe-lə-kwənt', example: 'The speaker gave an eloquent speech that moved the audience.', difficulty: 'medium' },
      { word: 'Ephemeral', meaning: 'Lasting for a very short time; transitory', pronunciation: 'i-ˈfe-mə-rəl', example: 'Trends on social media are often ephemeral.', difficulty: 'hard' },
      { word: 'Gregarious', meaning: 'Fond of being in company with others; living in groups', pronunciation: 'ɡrə-ˈɡer-ē-əs', example: 'Humans are gregarious creatures who need social interaction.', difficulty: 'medium' },
      { word: 'Pragmatic', meaning: 'Dealing with things in a practical, realistic way based on actual circumstances', pronunciation: 'præɡ-ˈmæ-tɪk', example: 'We need to take a pragmatic approach to solving this problem.', difficulty: 'medium' },
      { word: 'Rhetoric', meaning: 'The art of effective or persuasive speaking and writing', pronunciation: 'ˈre-tə-rik', example: 'Political speech often relies heavily on rhetoric rather than facts.', difficulty: 'hard' },
      { word: 'Serendipity', meaning: 'The occurrence of events by chance in a happy or beneficial way', pronunciation: 'ˌser-ən-ˈdɪ-pə-tē', example: 'Meeting my best friend was pure serendipity.', difficulty: 'hard' },
      { word: 'Ubiquitous', meaning: 'Present, appearing, or found everywhere', pronunciation: 'juː-ˈbɪ-kwɪ-təs', example: 'Smartphones have become ubiquitous in modern society.', difficulty: 'medium' },
      { word: 'Voracious', meaning: 'Wanting or devouring great quantities of food; having a huge appetite', pronunciation: 'və-ˈrā-shəs', example: 'The voracious reader finished three books in one week.', difficulty: 'medium' },
      { word: 'Zealous', meaning: 'Having or showing zeal; fervent', pronunciation: 'ˈze-ləs', example: 'The zealous volunteer worked tirelessly for the cause.', difficulty: 'easy' },
      { word: 'Altruistic', meaning: 'Showing a disinterested and selfless concern for the well-being of others', pronunciation: 'ˌal-tru-ˈi-stik', example: 'Her altruistic nature led her to donate to charity regularly.', difficulty: 'hard' }
    ];

    for (const vocab of vocabularies) {
      await db.query(
        'INSERT INTO vocabularies (word, meaning, pronunciation, example, difficulty) VALUES (?, ?, ?, ?, ?)',
        [vocab.word, vocab.meaning, vocab.pronunciation, vocab.example, vocab.difficulty]
      );
    }

    console.log(`Added ${vocabularies.length} vocabulary words successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addSampleVocabularies();