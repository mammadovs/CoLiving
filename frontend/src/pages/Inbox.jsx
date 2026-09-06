import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import LoadingState from '../components/LoadingState/LoadingState';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import { User } from 'lucide-react';
import './Inbox.css';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Dünən';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('az-AZ', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('az-AZ', { day: '2-digit', month: 'short' });
  }
}

function Inbox() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await apiClient('/messages/conversations');
        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="inbox-page">
        <div className="inbox-header"><h1>Mesajlar</h1></div>
        <LoadingState variant="skeleton" count={5} skeletonHeight={72} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="inbox-page">
        <div className="inbox-header"><h1>Mesajlar</h1></div>
        <ErrorState
          message="Mesajlar yüklənərkən xəta baş verdi."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="inbox-page">
        <div className="inbox-header"><h1>Mesajlar</h1></div>
        <EmptyState
          icon="💬"
          title="Hələ mesajınız yoxdur"
          description="Elan sahibləri ilə əlaqə saxladıqdan sonra söhbətləriniz burada görünəcək."
        />
      </div>
    );
  }

  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <h1>Mesajlar</h1>
        <span className="inbox-count">{conversations.length} söhbət</span>
      </div>

      <div className="inbox-list">
        {conversations.map((conv) => (
          <div
            key={conv.other_user_id}
            className={`inbox-item ${conv.unread_count > 0 ? 'unread' : ''}`}
            onClick={() => navigate(`/messages/${conv.other_user_id}`)}
          >
            <div className="inbox-avatar">
              <User size={24} />
            </div>

            <div className="inbox-item-body">
              <div className="inbox-item-top">
                <span className="inbox-item-name">
                  {conv.other_user_name || `İstifadəçi #${conv.other_user_id}`}
                </span>
                <span className="inbox-item-time">{formatTime(conv.last_message_at)}</span>
              </div>
              <div className="inbox-item-bottom">
                <span className="inbox-item-preview">
                  {conv.last_message || '—'}
                </span>
                {conv.unread_count > 0 && (
                  <span className="inbox-unread-badge">{conv.unread_count}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inbox;
