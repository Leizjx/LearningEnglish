import React from 'react';
// Xóa Outlet khỏi dòng import vì App.js không trực tiếp sử dụng nó
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizzesPage from './pages/QuizzesPage';
import QuizTakingPage from './pages/QuizTakingPage';
import QuizResultsPage from './pages/QuizResultsPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* --- PROTECTED ROUTES GROUP --- */}
            {/* PrivateRoute sẽ là nơi CHỨA và SỬ DỤNG Outlet */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/quiz-taking/:quizId" element={<QuizTakingPage />} />
              <Route path="/quiz-results/:attemptId" element={<QuizResultsPage />} />
              
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* --- DEFAULT REDIRECT --- */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={<div className="not-found">404 - Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;