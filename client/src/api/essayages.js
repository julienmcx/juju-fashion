import apiClient from './client';

export async function fetchEssayages(limit = 50) {
    const { data } = await apiClient.get('/essayages', { params: { limit } });
    return data;
}

export async function fetchEssayage(id) {
    const { data } = await apiClient.get(`/essayages/${id}`);
    return data;
}

export async function saveEssayage(id) {
    const { data } = await apiClient.post(`/essayages/${id}/save`);
    return data;
}

export async function deleteEssayage(id) {
    await apiClient.delete(`/essayages/${id}`);
}