import axiosInstance from './axiosInstance';

export const getAllVocabularies = async () => {
  try {
    const response = await axiosInstance.get('/vocabularies');
    return response.data;
  } catch (error) {
    console.error('Error getting vocabularies from API:', error);
    throw error;
  }
};

export const createVocabulary = async (vocab) => {
  try {
    const response = await axiosInstance.post('/vocabularies', vocab);
    return response.data;
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    throw error;
  }
};

export const updateVocabulary = async (id, vocab) => {
  try {
    const response = await axiosInstance.put(`/vocabularies/${id}`, vocab);
    return response.data;
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    throw error;
  }
};

export const deleteVocabulary = async (id) => {
  try {
    const response = await axiosInstance.delete(`/vocabularies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    throw error;
  }
};