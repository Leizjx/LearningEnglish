import axiosInstance from './axiosInstance';

export const getAdminOverview = async () => {
  const response = await axiosInstance.get('/admin/overview');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await axiosInstance.get('/admin/users');
  return response.data;
};

export const createAdminUser = async (userData) => {
  const response = await axiosInstance.post('/admin/users', userData);
  return response.data;
};

export const updateAdminUser = async (id, userData) => {
  const response = await axiosInstance.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await axiosInstance.delete(`/admin/users/${id}`);
  return response.data;
};
