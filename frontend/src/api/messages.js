import apiCall from './client'

export const messagesAPI = {
    getConversations: async () => apiCall('/messages/conversations', { method: 'GET' }),
    getConversation: async (otherUserId) => apiCall(`/messages/conversation/${otherUserId}`, { method: 'GET' }),
    sendMessage: async (receiverId, content) => apiCall('/messages/', { method: 'POST', body: JSON.stringify({ receiver_id: receiverId, content }) }),
}

export default messagesAPI
