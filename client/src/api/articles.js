import apiClient from './client';

export async function fetchArticles(params = {}) {
  const { data } = await apiClient.get('/articles', { params });
  return data;
}

export async function fetchArticle(id) {
  const { data } = await apiClient.get(`/articles/${id}`);
  return data;
}

export async function createArticle(payload) {
  const { data } = await apiClient.post('/articles', payload);
  return data;
}

export async function updateArticle(id, payload) {
  const { data } = await apiClient.put(`/articles/${id}`, payload);
  return data;
}

export async function deleteArticle(id) {
  await apiClient.delete(`/articles/${id}`);
}