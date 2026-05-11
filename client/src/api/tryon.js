import apiClient from './client';

export async function createTryOn(id_article) {
  const { data } = await apiClient.post('/tryon', { id_article });
  return data;
}

export async function fetchQuota() {
  const { data } = await apiClient.get('/tryon/quota');
  return data;
}
