import apiCall from './client'

export const authAPI = {
    login: async (email, password) => {
        const formData = new URLSearchParams({ username: email, password })
        return apiCall('/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
    },
    register: async (data) => apiCall('/users/', { method: 'POST', body: JSON.stringify(data) }),
    getCurrentUser: async () => apiCall('/users/me', { method: 'GET' }),
    getUser: async (userId) => apiCall(`/users/${userId}`, { method: 'GET' }),
}

export default authAPI
