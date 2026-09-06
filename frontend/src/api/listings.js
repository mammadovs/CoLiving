import apiCall from './client'

export const listingsAPI = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') params.append(key, value)
        })
        return apiCall(`/listings?${params.toString()}`, { method: 'GET' })
    },
    getById: async (id) => apiCall(`/listings/${id}`, { method: 'GET' }),
    create: async (data) => apiCall('/listings/', { method: 'POST', body: JSON.stringify(data) }),
    update: async (id, data) => apiCall(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: async (id) => apiCall(`/listings/${id}`, { method: 'DELETE' }),
    uploadImage: async (listingId, file) => {
        const formData = new FormData()
        formData.append('file', file)
        return apiCall(`/listings/${listingId}/images`, { method: 'POST', body: formData })
    },
}

export default listingsAPI
