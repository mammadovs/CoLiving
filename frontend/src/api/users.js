import apiCall from './client'

export const usersAPI = {
    getProfile: async (userId) => apiCall(`/users/${userId}`, { method: 'GET' }),
    updateProfile: async (data) => apiCall('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
    getUserListings: async (userId) => apiCall(`/users/${userId}/listings`, { method: 'GET' }),
    getCompatibility: async (userId) => apiCall(`/users/${userId}/compatibility`, { method: 'GET' }),
}

export default usersAPI
