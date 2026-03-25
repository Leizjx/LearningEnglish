const db = require('../config/db');

// Get all quizzes
async function getAllQuizzes() {
  try {
    const connection = await db.getConnection();
    const [quizzes] = await connection.query(
      `SELECT
        q.id,
        q.title,
        q.description,
        COUNT(qs.id) as questionCount,
        q.created_at
      FROM quizzes q
      LEFT JOIN questions qs ON q.id = qs.quiz_id
      GROUP BY q.id
      ORDER BY q.created_at DESC`
    );
    connection.release();
    
    // Đảm bảo quiz 9999 hiển thị tổng số câu hỏi ảo là 10
    const finalQuizzes = quizzes.map(q => {
      if (q.id === 9999) return { ...q, questionCount: 10, difficulty: 'mixed' };
      return q;
    });
    
    return finalQuizzes;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
}

// Get quiz with all questions and options
async function getQuizWithQuestions(quizId) {
  try {
    const connection = await db.getConnection();

    if (quizId == 9999) {
      const [words] = await connection.query('SELECT id, word, meaning FROM vocabulary ORDER BY RAND() LIMIT 10');
      if (words.length < 4) {
        connection.release();
        throw new Error('Cần thêm ít nhất 4 từ vựng trong kho để làm bài tập.');
      }
      const questionsWithOptions = await Promise.all(words.map(async (word) => {
        const [others] = await connection.query('SELECT id, meaning FROM vocabulary WHERE id != ? ORDER BY RAND() LIMIT 3', [word.id]);
        const options = [...others.map(o => ({ id: o.id, text: o.meaning })), { id: word.id, text: word.meaning }];
        return {
          id: word.id,
          quiz_id: 9999,
          question_text: `Từ "${word.word}" có nghĩa là gì?`,
          options: options.sort(() => Math.random() - 0.5)
        };
      }));
      connection.release();
      return {
        id: 9999,
        title: 'Vocabulary Master Quiz',
        description: 'Hệ thống tự động tạo 10 câu hỏi ngẫu nhiên từ kho từ vựng của bạn.',
        time_limit: 10,
        questions: questionsWithOptions
      };
    }

    // Get quiz details
    const [quiz] = await connection.query(
      'SELECT id, title, description FROM quizzes WHERE id = ?',
      [quizId]
    );

    if (quiz.length === 0) {
      connection.release();
      throw new Error('Quiz not found');
    }

    // Get questions for this quiz
    const [questions] = await connection.query(
      `SELECT
        q.id,
        q.quiz_id,
        q.question_text
      FROM questions q
      WHERE q.quiz_id = ?
      ORDER BY q.id ASC`,
      [quizId]
    );

    // Get options for each question
    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const [options] = await connection.query(
          `SELECT
            id,
            answer_text as option_text,
            is_correct
          FROM answers
          WHERE question_id = ?
          ORDER BY RAND()`,
          [question.id]
        );

        return {
          ...question,
          options: options.map(opt => ({
            id: opt.id,
            text: opt.option_text
            // Don't include is_correct on frontend
          }))
        };
      })
    );

    connection.release();

    return {
      ...quiz[0],
      questions: questionsWithOptions
    };
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
}

// Save quiz attempt and calculate score
async function saveQuizAttempt(userId, quizId, answers) {
  try {
    const connection = await db.getConnection();

    if (quizId == 9999) {
      let correctCount = 0;
      const detailedAnswers = [];
      for (const answer of answers) {
        const isCorrect = String(answer.questionId) === String(answer.selectedOptionId);
        if (isCorrect) correctCount++;
        detailedAnswers.push({
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: isCorrect
        });
      }
      const score = Math.round((correctCount / answers.length) * 100);

      const [result] = await connection.query(
        `INSERT INTO user_results (user_id, quiz_id, score, created_at) VALUES (?, ?, ?, NOW())`,
        [userId, quizId, score]
      );
      connection.release();
      return {
        attemptId: result.insertId,
        score: score,
        correctCount: correctCount,
        totalQuestions: answers.length,
        detailedAnswers: detailedAnswers
      };
    }

    // Get correct answers for verification
    const [correctAnswers] = await connection.query(
      `SELECT q.id as question_id, a.id as answer_id
       FROM questions q
       JOIN answers a ON q.id = a.question_id
       WHERE q.quiz_id = ? AND a.is_correct = 1`,
      [quizId]
    );

    // Calculate score
    let correctCount = 0;
    const detailedAnswers = [];

    for (const answer of answers) {
      const isCorrect = correctAnswers.some(
        ca => ca.question_id === answer.questionId && ca.answer_id === answer.selectedOptionId
      );

      if (isCorrect) {
        correctCount++;
      }

      detailedAnswers.push({
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect: isCorrect
      });
    }

    const score = Math.round((correctCount / answers.length) * 100);

    // Save result to user_results table
    const [result] = await connection.query(
      `INSERT INTO user_results (user_id, quiz_id, score, created_at)
       VALUES (?, ?, ?, NOW())`,
      [userId, quizId, score]
    );

    // Save individual answers to user_answers table
    for (const answer of answers) {
      const isCorrect = correctAnswers.some(
        ca => ca.question_id === answer.questionId && ca.answer_id === answer.selectedOptionId
      );

      await connection.query(
        `INSERT INTO user_answers (user_id, question_id, answer_id, is_correct, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, answer.questionId, answer.selectedOptionId, isCorrect ? 1 : 0]
      );
    }

    connection.release();

    return {
      attemptId: result.insertId,
      score: score,
      correctCount: correctCount,
      totalQuestions: answers.length,
      detailedAnswers: detailedAnswers
    };
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    throw error;
  }
}

// Get user's quiz progress
async function getUserQuizProgress(userId) {
  try {
    const connection = await db.getConnection();

    const [progress] = await connection.query(
      `SELECT
        q.id,
        q.title,
        COUNT(ur.id) as attempts,
        MAX(ur.score) as highestScore,
        AVG(ur.score) as averageScore,
        MAX(ur.created_at) as lastAttempted
      FROM quizzes q
      LEFT JOIN user_results ur ON q.id = ur.quiz_id AND ur.user_id = ?
      GROUP BY q.id
      ORDER BY q.created_at DESC`,
      [userId]
    );

    connection.release();
    return progress;
  } catch (error) {
    console.error('Error fetching user quiz progress:', error);
    throw error;
  }
}

// Get specific quiz attempt details
async function getAttemptDetails(userId, attemptId) {
  try {
    const connection = await db.getConnection();

    // Get the result
    const [result] = await connection.query(
      `SELECT
        ur.id,
        ur.quiz_id,
        ur.score,
        ur.created_at,
        q.title as quiz_title
      FROM user_results ur
      JOIN quizzes q ON ur.quiz_id = q.id
      WHERE ur.id = ? AND ur.user_id = ?`,
      [attemptId, userId]
    );

    if (result.length === 0) {
      connection.release();
      throw new Error('Attempt not found');
    }

    if (result[0].quiz_id == 9999) {
      connection.release();
      return {
        ...result[0],
        answers: [] 
      };
    }

    // Get the answers for this attempt
    const [answers] = await connection.query(
      `SELECT
        ua.question_id,
        ua.answer_id as selectedOptionId,
        ua.is_correct,
        q.question_text,
        a.answer_text as selectedAnswerText
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      JOIN answers a ON ua.answer_id = a.id
      WHERE ua.user_id = ? AND q.quiz_id = ?
      ORDER BY ua.created_at ASC`,
      [userId, result[0].quiz_id]
    );

    connection.release();

    return {
      ...result[0],
      answers: answers.map(ans => ({
        questionId: ans.question_id,
        selectedOptionId: ans.selectedOptionId,
        isCorrect: ans.is_correct === 1,
        questionText: ans.question_text,
        selectedAnswerText: ans.selectedAnswerText
      }))
    };
  } catch (error) {
    console.error('Error fetching attempt details:', error);
    throw error;
  }
}

// Create a custom quiz dynamically
async function createCustomQuiz(title, description, vocabularies) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [quizResult] = await connection.query(
      'INSERT INTO quizzes (title, description, created_at) VALUES (?, ?, NOW())',
      [title, description || 'Quiz tự tạo của bạn']
    );
    const quizId = quizResult.insertId;

    const [allVocab] = await connection.query('SELECT meaning FROM vocabulary ORDER BY RAND() LIMIT 20');
    
    for (const v of vocabularies) {
      if (!v.word || !v.meaning) continue;

      const [questionResult] = await connection.query(
        'INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)',
        [quizId, `Từ "${v.word}" có nghĩa là gì?`]
      );
      const questionId = questionResult.insertId;

      await connection.query(
        'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, 1)',
        [questionId, v.meaning]
      );

      const wrongMeans = allVocab.filter(av => av.meaning !== v.meaning).slice(0, 3);
      const fallbacks = ['Con bò', 'Cái bàn', 'Chạy bộ', 'Bầu trời', 'Xinh đẹp', 'Quả táo', 'Điện thoại', 'Xe hơi'];
      let wp = 0;
      for (let i = 0; i < 3; i++) {
        const wrongText = wrongMeans[i] ? wrongMeans[i].meaning : fallbacks[wp++];
        await connection.query(
          'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, 0)',
          [questionId, wrongText]
        );
      }
    }

    await connection.commit();
    return { success: true, quizId };
  } catch (error) {
    await connection.rollback();
    console.error('Error creating custom quiz:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllQuizzes,
  getQuizWithQuestions,
  saveQuizAttempt,
  getUserQuizProgress,
  getAttemptDetails,
  createCustomQuiz
};
