import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar/Avatar'
import Input from '../components/Input/Input'
import Button from '../components/Button/Button'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { messagesAPI } from '../api/messages'
import './ConversationView.css'

function ConversationView() {
    const { userId } = useParams()
    const [messages, setMessages] = useState([])
    const [status, setStatus] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')
    const [draft, setDraft] = useState('')
    const loadConversation = useCallback(async () => {
        setStatus('loading')
        try {
            const response = await messagesAPI.getConversation(userId)
            const loaded = Array.isArray(response) ? response : response.items || []
            setMessages(loaded)
            setStatus(loaded.length ? 'success' : 'empty')
        } catch (error) {
            setErrorMessage(error.data?.detail || error.message || 'Mesajları yükləmək mümkün olmadı.')
            setStatus('error')
        }
    }, [userId])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadConversation()
    }, [loadConversation])

    const send = async (event) => {
        event.preventDefault()
        if (!draft.trim()) return
        try {
            await messagesAPI.sendMessage(userId, draft.trim())
            setDraft('')
            loadConversation()
        } catch (error) {
            setErrorMessage(error.data?.detail || error.message || 'Mesaj göndərmək mümkün olmadı.')
            setStatus('error')
        }
    }

    if (status === 'loading') return <Spinner />
    if (status === 'error') return <ErrorState message={errorMessage} onRetry={loadConversation} />

    return <section className="conversation-page"><Link to="/messages" className="conversation-back">Back to inbox</Link><header className="conversation-header"><Avatar name={userId} /><h1>Conversation</h1></header>{status === 'empty' ? <EmptyState title="İlk mesajı siz göndərin" /> : <div className="message-list">{messages.map((message) => <p key={message.id}>{message.content}</p>)}</div>}<form className="message-form" onSubmit={send}><Input placeholder="Write a message..." value={draft} onChange={(event) => setDraft(event.target.value)} /><Button type="submit">Send</Button></form></section>
}

export default ConversationView
