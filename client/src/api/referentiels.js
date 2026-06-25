import apiClient from './client';

export async function fetchCategories() {
  const { data } = await apiClient.get('/categories');
  return data.categories;
}

export async function fetchCouleurs() {
  const { data } = await apiClient.get('/couleurs');
  return data.couleurs;
}

export async function fetchMatieres() {
  const { data } = await apiClient.get('/matieres');
  return data.matieres;
}

export async function fetchMarques() {
  const { data } = await apiClient.get('/marques');
  return data.marques;
}

export async function createMarque(nom_marque) {
  const { data } = await apiClient.post('/marques', { nom_marque });
  return data.marque;
}

export async function deleteMarque(id) {
  await apiClient.delete(`/marques/${id}`);
}