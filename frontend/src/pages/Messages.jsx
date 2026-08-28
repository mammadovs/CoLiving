import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar/Avatar'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { messagesAPI } from '../api/messages'
import './Messages.css'

function Messages() {
    const [conversations, setConversations] = useState([])
    const [status, setStatus] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')

    const loadConversations = useCallback(async () => {
        setStatus('loading')
        try {
            const response = await messagesAPI.getConversations()
            const loaded = Array.isArray(response) ? response : response.items || []
            setConversations(loaded)
            setStatus(loaded.length ? 'success' : 'empty')
        } catch (error) {
            setErrorMessage(error.data?.detail || error.message || 'Söhbətləri yükləmək mümkün olmadı.')
            setStatus('error')
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadConversations()
    }, [loadConversations])

    if (status === 'loading') return <Spinner />
    if (status === 'empty') return <EmptyState title="Hələ heç kimlə yazışmamısınız" />
    if (status === 'error') return <ErrorState message={errorMessage} onRetry={loadConversations} />

    return <section className="messages-page"><h1>Messages</h1><div className="messages-layout"><div className="inbox-panel">{conversations.map((conversation) => { const userId = conversation.other_user_id || conversation.user_id; const name = conversation.other_user_name || conversation.user_name || 'User'; return <Link key={userId} to={`/messages/${userId}`} className="conversation-item"><Avatar name={name} size="sm" /><div><strong>{name}</strong><span>{conversation.last_message || 'Open conversation'}</span></div></Link> })}</div><div className="conversation-placeholder"><p>Select a conversation to start messaging.</p></div></div></section>
}

export default Messages
