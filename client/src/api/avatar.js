import apiClient from './client';

export async function fetchAvatarPhotos() {
  const { data } = await apiClient.get('/avatar/photos');
  return data; // { photos, angles_attendus, total }
}

export async function uploadAvatarPhoto(file, angle) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('angle', angle);
  const { data } = await apiClient.post('/avatar/photos', formData);
  return data.photo;
}

export async function deleteAvatarPhoto(angle) {
  await apiClient.delete(`/avatar/photos/${angle}`);
}