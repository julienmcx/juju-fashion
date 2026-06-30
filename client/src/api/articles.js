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

export async function toggleFavori(id) {
  const { data } = await apiClient.patch(`/articles/${id}/favori`, {});
  return data;
}

// Persiste l'ordre personnalisé des articles (drag & drop).
// `order` est un tableau d'id_article dans l'ordre souhaité.
export async function reorderArticles(order) {
  const { data } = await apiClient.patch('/articles/reorder', { order });
  return data;
}