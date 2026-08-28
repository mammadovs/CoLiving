const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
            ...options.headers,
        },
    })

    let data
    try {
        data = await response.json()
    } catch {
        data = {}
    }

    if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (typeof window !== 'undefined') window.location.href = '/login'
    }

    if (!response.ok) {
        const error = new Error(data.detail || data.message || 'An error occurred')
        error.status = response.status
        error.data = data
        throw error
    }

    return data
}

export default apiCall
