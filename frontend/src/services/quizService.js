import axiosInstance from './axiosInstance';

// Get all quizzes
export const getAllQuizzes = async () => {
  try {
    const response = await axiosInstance.get('/quizzes');
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

// Get specific quiz with questions
export const getQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.get(`/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
};

// Submit quiz answers and get score
export const submitQuiz = async (quizId, answers) => {
  try {
    const response = await axiosInstance.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

// Get user's quiz progress
export const getUserQuizProgress = async () => {
  try {
    const response = await axiosInstance.get('/quizzes/user/progress/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

// Get specific attempt details
export const getAttemptDetails = async (attemptId) => {
  try {
    const response = await axiosInstance.get(`/quizzes/attempt/${attemptId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attempt details:', error);
    throw error;
  }
};

// Delete a quiz
export const deleteQuiz = async (quizId) => {
  try {
    const response = await axiosInstance.delete(`/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
};
