import api from './api';

const unwrap = (response) => response.data.data;

export const petsService = {
    list: () => api.get('/pets').then(unwrap),
    getById: (id) => api.get(`/pets/${id}`).then(unwrap),
    create: (payload) => api.post('/pets', payload).then(unwrap),
    update: (id, payload) => api.put(`/pets/${id}`, payload).then(unwrap),
    remove: (id) => api.delete(`/pets/${id}`).then(unwrap),
};

export const ownersService = {
    list: () => api.get('/owners').then(unwrap),
    getById: (id) => api.get(`/owners/${id}`).then(unwrap),
    create: (payload) => api.post('/owners', payload).then(unwrap),
    update: (id, payload) => api.put(`/owners/${id}`, payload).then(unwrap),
    remove: (id) => api.delete(`/owners/${id}`).then(unwrap),
};
