import apiClient from './client';

export async function createTryOn(id_article) {
  const { data } = await apiClient.post('/tryon', { id_article });
  return data; // { article, results, errors, stats }
}

export async function fetchQuota() {
  const { data } = await apiClient.get('/tryon/quota');
  return data; // { used, limit, remaining }
}