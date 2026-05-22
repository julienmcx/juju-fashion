import apiClient from './client';

export async function fetchProfileStats() {
  const { data } = await apiClient.get('/profile/stats');
  return data;
}

export async function updateAvatar(avatar_url) {
  const { data } = await apiClient.put('/profile/avatar', { avatar_url });
  return data;
}