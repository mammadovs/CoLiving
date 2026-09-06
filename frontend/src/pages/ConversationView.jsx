import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Avatar from '../components/Avatar/Avatar'
import Input from '../components/Input/Input'
import Button from '../components/Button/Button'
import Spinner from '../components/Spinner/Spinner'
import EmptyState from '../components/EmptyState/EmptyState'
import ErrorState from '../components/ErrorState/ErrorState'
import { messagesAPI } from '../api/messages'
import './ConversationView.css'

function formatTime(isoString) {
    try {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
        return ''
    }
}

function ConversationView() {
    const { userId } = useParams()
    const [messages, setMessages] = useState([])
    const [status, setStatus] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')
    const [draft, setDraft] = useState('')
    const bottomRef = useRef(null)

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const currentUserId = storedUser.id

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

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

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

    return (
        <section className="conversation-page">
            <header className="conversation-header">
                <Link to="/messages" className="conversation-back"><ArrowLeft size={18} /></Link>
                <Avatar name={userId} />
                <h1>Conversation</h1>
            </header>

            <div className="conversation-body">
                {status === 'empty' ? (
                    <EmptyState title="İlk mesajı siz göndərin" />
                ) : (
                    <div className="message-list">
                        {messages.map((message) => {
                            const isMine = String(message.sender_id) === String(currentUserId)
                            return (
                                <div key={message.id} className={`message-row ${isMine ? 'message-row-mine' : 'message-row-theirs'}`}>
                                    <div className={`message-bubble ${isMine ? 'message-bubble-mine' : 'message-bubble-theirs'}`}>
                                        <p>{message.content}</p>
                                        <span className="message-time">{formatTime(message.created_at)}</span>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            <form className="message-form" onSubmit={send}>
                <Input placeholder="Write a message..." value={draft} onChange={(event) => setDraft(event.target.value)} />
                <Button type="submit">Send</Button>
            </form>
        </section>
    )
}

export default ConversationView