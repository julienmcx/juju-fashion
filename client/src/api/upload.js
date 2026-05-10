import apiClient from './client';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await apiClient.post('/upload', formData);
  return data; // { url, filename, size, mimetype }
}