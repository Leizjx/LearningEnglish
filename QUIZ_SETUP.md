# Quiz System - Setup Guide

## Overview
The English App now includes a complete quiz system that allows users to test their knowledge with multiple-choice questions, calculate scores, and track their progress.

## Features

### Backend Features
- ✅ RESTful API endpoints for quiz management
- ✅ Multiple choice question support
- ✅ Automatic score calculation
- ✅ Quiz attempt tracking and storage
- ✅ User progress monitoring
- ✅ Difficulty levels (easy, medium, hard)
- ✅ Time limit support per quiz

### Frontend Features
- ✅ Quiz list with filtering by difficulty
- ✅ Interactive quiz-taking interface
- ✅ Real-time progress tracking
- ✅ Question navigation with indicators
- ✅ Detailed results with performance breakdown
- ✅ Attempt history and comparison
- ✅ Responsive design for mobile/tablet/desktop

## Database Setup

### 1. Create Tables
Run the SQL commands from `backend/quiz_sample_data.sql` to create the required tables:

```bash
# Using MySQL client
mysql -h YOUR_DB_HOST -u YOUR_USERNAME -p YOUR_DATABASE < backend/quiz_sample_data.sql
```

### 2. Tables Created
- **quizzes**: Stores quiz metadata (title, description, difficulty, time limit)
- **quiz_questions**: Individual questions within each quiz
- **quiz_options**: Multiple choice options for each question
- **quiz_attempts**: User quiz attempts and scores

## Backend API Endpoints

### Get All Quizzes
```
GET /api/quizzes
Response:
{
  success: true,
  data: [
    {
      id: 1,
      title: "Vocabulary Basics",
      description: "Learn common English words",
      difficulty: "easy",
      questionCount: 4
    }
  ]
}
```

### Get Quiz with Questions
```
GET /api/quizzes/:id
Response:
{
  success: true,
  data: {
    id: 1,
    title: "Vocabulary Basics",
    questions: [
      {
        id: 1,
        question_text: "What is the meaning of BENEVOLENT?",
        options: [
          { id: 1, text: "Kind and generous" },
          { id: 2, text: "Angry and hostile" }
        ]
      }
    ]
  }
}
```

### Submit Quiz (Protected)
```
POST /api/quizzes/:id/submit
Authorization: Bearer TOKEN
Body:
{
  answers: [
    { questionId: 1, selectedOptionId: 1 },
    { questionId: 2, selectedOptionId: 4 }
  ]
}
Response:
{
  success: true,
  data: {
    attemptId: 1,
    score: 75,
    correctCount: 3,
    totalQuestions: 4,
    detailedAnswers: [...]
  }
}
```

### Get User Progress (Protected)
```
GET /api/quizzes/user/progress/all
Authorization: Bearer TOKEN
Response:
{
  success: true,
  data: [
    {
      id: 1,
      title: "Vocabulary Basics",
      attempts: 2,
      highestScore: 100,
      averageScore: 87.5,
      lastAttempted: "2024-03-25T10:30:00Z"
    }
  ]
}
```

### Get Attempt Details (Protected)
```
GET /api/quizzes/attempt/:attemptId
Authorization: Bearer TOKEN
Response:
{
  success: true,
  data: {
    id: 1,
    quiz_id: 1,
    quiz_title: "Vocabulary Basics",
    score: 75,
    answers: [
      { questionId: 1, selectedOptionId: 1, isCorrect: true },
      { questionId: 2, selectedOptionId: 4, isCorrect: false }
    ],
    completed_at: "2024-03-25T10:30:00Z"
  }
}
```

## Frontend Components

### QuizzesPage (`src/pages/QuizzesPage.js`)
- Displays all available quizzes
- Filter by difficulty level
- Shows user's best score and attempt count for completed quizzes
- Links to quiz-taking interface

### QuizTakingPage (`src/pages/QuizTakingPage.js`)
- Interactive quiz interface
- Question-by-question navigation
- Visual progress indicator
- Time limit countdown
- Question indicators showing which questions are answered
- Submit button appears on last question

### QuizResultsPage (`src/pages/QuizResultsPage.js`)
- Score display with color-coded feedback
- Performance breakdown (correct vs incorrect)
- Detailed review of answers with explanations
- Option to retake quiz
- Navigation to quiz list or dashboard

## File Structure

```
backend/
├── services/
│   └── quizService.js          # Business logic for quizzes
├── controllers/
│   └── quizController.js       # HTTP request handlers
├── routes/
│   └── quizRoutes.js           # Quiz API routes
└── quiz_sample_data.sql        # Database initialization

frontend/
├── src/
│   ├── services/
│   │   └── quizService.js      # API client functions
│   └── pages/
│       ├── QuizzesPage.js      # Quiz list component
│       ├── QuizzesPage.css
│       ├── QuizTakingPage.js   # Quiz interface
│       ├── QuizTakingPage.css
│       ├── QuizResultsPage.js  # Results display
│       └── QuizResultsPage.css
```

## Sample Quiz Data

The SQL file includes 4 pre-loaded quizzes:

1. **Vocabulary Basics** (Easy, 20 min)
   - 4 vocabulary questions
   - Topics: benevolent, ephemeral, pragmatic, eloquent

2. **Synonym Challenge** (Medium, 25 min)
   - 4 synonym matching questions
   - Topics: gregarious, ambiguous, serendipity, rhetoric

3. **Grammar Essentials** (Medium, 30 min)
   - 4 grammar correction questions
   - Topics: verb tenses, subject-verb agreement, conditionals

4. **Advanced Reading** (Hard, 40 min)
   - 4 reading comprehension questions
   - Topics: vocabulary in context, formal writing style

## Score Calculation

- Each question is worth 100/total_questions points
- Score = (Correct Answers / Total Questions) × 100
- Results are saved to database immediately

## Progress Tracking

User progress is tracked by:
- Number of quiz attempts
- Best score (highest score achieved)
- Average score across all attempts
- Last attempted date
- Detailed answer history for each attempt

## Frontend Routes

- `/quizzes` - Quiz list and selection
- `/quiz-taking/:quizId` - Take quiz
- `/quiz-results/:attemptId` - View results and detailed review

## Usage Flow

1. User navigates from dashboard to "Quizzes" feature
2. Browse available quizzes or filter by difficulty
3. Click "Start Quiz" to begin
4. Answer all questions using navigation or direct question buttons
5. Submit when all questions are answered
6. View score, performance breakdown, and detailed review
7. Option to retake quiz or return to quiz list

## Styling

All components are fully responsive:
- Desktop (1024px+): Full feature grid layout
- Tablet (768px-1023px): Adjusted grid and spacing
- Mobile (480px-767px): Single column layout
- Small phone (<480px): Minimal layout with optimized spacing

## Future Enhancements

- [ ] Category-based questions
- [ ] Spaced repetition scheduling
- [ ] Leaderboard / Competition
- [ ] Timed practice mode
- [ ] Question difficulty adjustment
- [ ] Custom quiz creation
- [ ] Detailed statistics dashboard
- [ ] Email notifications for progress

## Troubleshooting

### Quiz Not Loading
- Verify database tables are created
- Check that quiz data is inserted correctly
- Confirm JWT token is valid (protected endpoints)

### Score Not Calculating
- Ensure all questions have at least one correct answer marked
- Verify answer format matches API specification
- Check database for quiz_attempts records

### Time Limit Not Working
- Confirm time_limit is set in quizzes table
- Check browser timezone settings
- Verify JavaScript timer logic in QuizTakingPage

## Support
For issues or questions, check the component files or backend services for detailed comments.
