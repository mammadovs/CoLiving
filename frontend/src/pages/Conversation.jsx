import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import LoadingState from '../components/LoadingState/LoadingState';
import ErrorState from '../components/ErrorState/ErrorState';
import { ArrowLeft, Send } from 'lucide-react';
import './Conversation.css';

const POLL_INTERVAL_MS = 5000;

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dünən';
  return date.toLocaleDateString('az-AZ', { day: '2-digit', month: 'long', year: 'numeric' });
}

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
         da.getMonth()    === db.getMonth()    &&
         da.getDate()     === db.getDate();
}

function Conversation() {
  const { userId: otherUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [otherUserName, setOtherUserName] = useState(`İstifadəçi #${otherUserId}`);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isMounted = useRef(true);

  // Fetch conversation messages
  const fetchMessages = useCallback(async (isInitial = false) => {
    try {
      const data = await apiClient(`/messages/conversation/${otherUserId}`);
      if (!isMounted.current) return;
      const msgs = Array.isArray(data) ? data : (data.messages || []);
      setMessages(msgs);
      if (isInitial) setLoading(false);
    } catch (err) {
      if (!isMounted.current) return;
      if (isInitial) {
        setError(true);
        setLoading(false);
      }
    }
  }, [otherUserId]);

  // Fetch other user name
  useEffect(() => {
    const getUser = async () => {
      try {
        const u = await apiClient(`/users/${otherUserId}`);
        if (isMounted.current) setOtherUserName(u.full_name || u.email || `İstifadəçi #${otherUserId}`);
      } catch (_) {}
    };
    getUser();
  }, [otherUserId]);

  // Initial load + 5s polling
  useEffect(() => {
    isMounted.current = true;
    fetchMessages(true);

    const interval = setInterval(() => {
      fetchMessages(false);
    }, POLL_INTERVAL_MS);

    // Cleanup: stop polling on unmount
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    // Optimistic UI — instantly append message before API confirms
    const optimisticMsg = {
      id: `optimistic-${Date.now()}`,
      sender_id: user.id,
      receiver_id: Number(otherUserId),
      content,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');

    setSending(true);
    try {
      await apiClient('/messages/', {
        method: 'POST',
        body: { receiver_id: Number(otherUserId), content },
      });
      // Replace optimistic with real data
      fetchMessages(false);
    } catch (err) {
      // Roll back optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setInput(content); // restore input
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ---- Loading ----
  if (loading) {
    return (
      <div className="conv-page">
        <div className="conv-topbar">
          <button className="conv-back-btn" onClick={() => navigate('/messages')}>
            <ArrowLeft size={20} />
          </button>
          <div className="conv-topbar-name skeleton-name" />
        </div>
        <div className="conv-messages" style={{ padding: '1.5rem' }}>
          <LoadingState variant="skeleton" count={6} skeletonHeight={44} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conv-page">
        <div className="conv-topbar">
          <button className="conv-back-btn" onClick={() => navigate('/messages')}>
            <ArrowLeft size={20} />
          </button>
          <span className="conv-topbar-name">Xəta</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <ErrorState
            message="Mesajlar yüklənərkən xəta baş verdi."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="conv-page">
      {/* Top bar */}
      <div className="conv-topbar">
        <button className="conv-back-btn" onClick={() => navigate('/messages')}>
          <ArrowLeft size={20} />
        </button>
        <div className="conv-topbar-avatar">{otherUserName.charAt(0).toUpperCase()}</div>
        <div className="conv-topbar-info">
          <span className="conv-topbar-name">{otherUserName}</span>
          <span className="conv-topbar-status">
            <span className="status-dot" /> Hər 5 san. yenilənir
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="conv-messages">
        {messages.length === 0 && (
          <div className="conv-empty">Hələ mesaj yoxdur. İlk sözü siz edin! 👋</div>
        )}

        {messages.map((msg, idx) => {
          const isOwn = msg.sender_id === user?.id;
          const showDivider =
            idx === 0 ||
            !isSameDay(messages[idx - 1].created_at, msg.created_at);

          return (
            <div key={msg.id}>
              {showDivider && (
                <div className="conv-date-divider">
                  <span>{formatDateDivider(msg.created_at)}</span>
                </div>
              )}
              <div className={`conv-msg-row ${isOwn ? 'own' : 'other'}`}>
                <div className={`conv-bubble ${isOwn ? 'bubble-own' : 'bubble-other'} ${msg._optimistic ? 'bubble-optimistic' : ''}`}>
                  <p>{msg.content}</p>
                  <span className="conv-ts">{formatTimestamp(msg.created_at)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="conv-input-bar">
        <textarea
          ref={inputRef}
          className="conv-input"
          placeholder="Mesaj yazın..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={sending}
        />
        <button
          className="conv-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default Conversation;
