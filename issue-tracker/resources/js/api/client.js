import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

export const issues = {
    list: (params) => api.get('/issues', { params }),
    get: (id) => api.get(`/issues/${id}`),
    create: (data) => api.post('/issues', data),
    update: (id, data) => api.patch(`/issues/${id}`, data),
};

export const comments = {
    create: (issueId, data) => api.post(`/issues/${issueId}/comments`, data),
};

export default api;
