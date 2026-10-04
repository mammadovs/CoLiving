import apiCall from './client'
import { mockListings } from '../data/mockData'

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Simulate a short network delay in mock mode
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

// Client-side filter + paginate the mock data the same way the server would
function filterMock(listings, filters = {}) {
    let result = [...listings]

    if (filters.district)             result = result.filter((l) => l.district === filters.district)
    if (filters.nearest_university)   result = result.filter((l) => l.nearest_university === filters.nearest_university)
    if (filters.preferred_gender && filters.preferred_gender !== 'any')
                                      result = result.filter((l) => l.preferred_gender === 'any' || l.preferred_gender === filters.preferred_gender)
    if (filters.religion_preference)  result = result.filter((l) => l.religion_preference === filters.religion_preference)
    if (filters.min_price)            result = result.filter((l) => l.price_per_person >= Number(filters.min_price))
    if (filters.max_price)            result = result.filter((l) => l.price_per_person <= Number(filters.max_price))
    if (filters.has_wifi === 'true' || filters.has_wifi === true)
                                      result = result.filter((l) => l.has_wifi)
    if (filters.is_furnished === 'true' || filters.is_furnished === true)
                                      result = result.filter((l) => l.is_furnished)
    if (filters.min_available_spots)  result = result.filter((l) => l.available_spots >= Number(filters.min_available_spots))

    const skip = Number(filters.skip) || 0
    const limit = Number(filters.limit) || 100
    return result.slice(skip, skip + limit)
}

export const listingsAPI = {
    getAll: async (filters = {}) => {
        if (IS_MOCK) {
            await delay()
            return filterMock(mockListings, filters)
        }
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') params.append(key, value)
        })
        return apiCall(`/listings?${params.toString()}`, { method: 'GET' })
    },

    getById: async (id) => {
        if (IS_MOCK) {
            await delay()
            const listing = mockListings.find((l) => String(l.id) === String(id))
            if (!listing) {
                // eslint-disable-next-line no-throw-literal
                throw { status: 404, data: { detail: 'Not found' } }
            }
            return listing
        }
        return apiCall(`/listings/${id}`, { method: 'GET' })
    },

    geocode: async (address, district) => {
        if (IS_MOCK) {
            await delay(400)
            // Return the center of Baku as a fake geocode result
            return { latitude: 40.4093 + (Math.random() - 0.5) * 0.02, longitude: 49.8671 + (Math.random() - 0.5) * 0.02 }
        }
        const params = new URLSearchParams({ address })
        if (district) params.append('district', district)
        return apiCall(`/listings/geocode?${params.toString()}`, { method: 'GET' })
    },

    create: async (data) => {
        if (IS_MOCK) {
            await delay(300)
            return { ...data, id: Date.now(), images: [], user_id: 999 }
        }
        return apiCall('/listings/', { method: 'POST', body: JSON.stringify(data) })
    },

    update: async (id, data) => {
        if (IS_MOCK) {
            await delay(300)
            return { ...data, id }
        }
        return apiCall(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) })
    },

    delete: async (id) => {
        if (IS_MOCK) {
            await delay(200)
            return { success: true, id }
        }
        return apiCall(`/listings/${id}`, { method: 'DELETE' })
    },

    uploadImage: async (listingId, file) => {
        if (IS_MOCK) {
            await delay(500)
            return { id: Date.now(), image_url: URL.createObjectURL(file) }
        }
        const formData = new FormData()
        formData.append('file', file)
        return apiCall(`/listings/${listingId}/images`, { method: 'POST', body: formData })
    },
}

export default listingsAPI
