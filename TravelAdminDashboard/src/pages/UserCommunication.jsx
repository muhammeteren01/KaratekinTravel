import React, { useEffect, useMemo, useRef, useState } from 'react';
import './UserCommunication.css';
import ReportModal from '../components/ReportModal';
import { fetchChatMessagesApi, fetchMeApi, fetchMyChatsApi, sendChatMessageApi } from '../services/adminApi';
import { useFeedback } from '../components/feedback/feedbackContext';

function formatRelative(ts) {
  const diff = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  const d = Math.floor(h / 24);
  return `${d}g`;
}

const Avatar = ({ name }) => {
  const letter = (name || '?')[0]?.toUpperCase() || '?';
  return (
    <div className="uc-avatar" aria-hidden>
      {letter}
    </div>
  );
};

const UserCommunication = () => {
  const { notify } = useFeedback();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [text, setText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [unread, setUnread] = useState({});
  const [typing, setTyping] = useState({});
  const [flagged, setFlagged] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const threadRef = useRef(null);
  const scrollToBottom = () => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    let alive = true;

    const loadChats = async () => {
      try {
        setLoading(true);
        setError('');

        const [me, chatsResponse] = await Promise.all([fetchMeApi(), fetchMyChatsApi()]);
        if (!alive) return;

        const normalizedChats = (Array.isArray(chatsResponse) ? chatsResponse : []).map((chat) => ({
          id: String(chat.id),
          name: chat.groupName || chat.trip?.title || 'Sohbet',
          online: true,
          lastActivity: chat.lastActivity,
          memberCount: chat.memberCount || 0,
          trip: chat.trip,
        }));

        setCurrentUserId(me?.id || null);
        setChats(normalizedChats);

        if (normalizedChats.length > 0) {
          setSelectedId(normalizedChats[0].id);
        }
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Sohbetler yüklenemedi.');
        setChats([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadChats();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    if (messagesByChat[selectedId]) return;

    let alive = true;

    fetchChatMessagesApi(selectedId)
      .then((response) => {
        if (!alive) return;
        setMessagesByChat((prev) => ({
          ...prev,
          [selectedId]: (Array.isArray(response) ? response : []).map((message) => ({
            id: message.id,
            from: String(message.senderId) === String(currentUserId) ? 'agent' : 'user',
            text: message.text,
            ts: message.createdAt ? new Date(message.createdAt).getTime() : Date.now(),
          })),
        }));
      })
      .catch(() => {
        if (!alive) return;
        setMessagesByChat((prev) => ({ ...prev, [selectedId]: [] }));
      });

    return () => {
      alive = false;
    };
  }, [selectedId, currentUserId, messagesByChat]);

  const usersDerived = useMemo(() => {
    const v = query.toLowerCase();
    return chats
      .map(u => {
        const list = messagesByChat[u.id] || [];
        const last = list[list.length - 1];
        return {
          ...u,
          lastMsg: last?.text || u.trip?.title || '—',
          lastTime: last?.ts ? formatRelative(last.ts) : '',
          unread: unread[u.id] || 0,
          flagged: !!flagged[u.id],
        };
      })
      .filter(u => !query || `${u.name} ${u.lastMsg}`.toLowerCase().includes(v));
  }, [query, chats, messagesByChat, unread, flagged]);

  const currentThread = messagesByChat[selectedId] || [];
  const selectedUser = chats.find(u => u.id === selectedId);

  const appendMessage = (groupId, msg) => {
    setMessagesByChat((prev) => ({ ...prev, [groupId]: [ ...(prev[groupId] || []), msg ] }));
  };

  const send = () => {
    const t = text.trim();
    if (!t || !selectedId) return;

    setTyping((prev) => ({ ...prev, [selectedId]: true }));
    sendChatMessageApi(selectedId, { text: t, attachmentUrl: null })
      .then((message) => {
        appendMessage(selectedId, {
          id: message?.id || `a_${Date.now()}`,
          from: 'agent',
          text: message?.text || t,
          ts: message?.createdAt ? new Date(message.createdAt).getTime() : Date.now(),
        });
        setText('');
        setUnread((prev) => ({ ...prev, [selectedId]: 0 }));
        setTimeout(scrollToBottom, 0);
      })
      .catch((err) => notify(err instanceof Error ? err.message : 'Mesaj gönderilemedi.', 'error'))
      .finally(() => setTyping((prev) => ({ ...prev, [selectedId]: false })));
  };

  const onSelectUser = (id) => {
    setSelectedId(id);
    setUnread(prev => ({ ...prev, [id]: 0 }));
    setTimeout(scrollToBottom, 0);
  };

  const onReportSubmit = (payload) => {
    // mark flagged and add system message
    setFlagged(prev => ({ ...prev, [selectedId]: true }));
    appendMessage(selectedId, { id: `s_${Date.now()}`, from: 'system', text: `Sohbet bildirildi: ${payload.category || 'Diğer'}`, ts: Date.now() });
  };

  return (
    <div className="uc-page">
      <div className="uc-grid">
        {/* Left list */}
        <aside className="uc-left">
          <div className="uc-left-header">
            <h3>Kullanıcı Mesajları <span className="uc-badge">{chats.length}</span></h3>
          </div>
          <div className="uc-search">
            <img src="/icons/search-icon.svg" alt="Ara" />
            <input placeholder="Mesaj Ara..." value={query} onChange={(e)=>setQuery(e.target.value)} />
          </div>
          <div className="uc-list">
            {error && <div className="table-error">{error}</div>}
            {loading ? (
              <div className="uc-item">Sohbetler yükleniyor...</div>
            ) : usersDerived.map(u => (
              <button key={u.id} className={`uc-item ${selectedId===u.id? 'active':''} ${u.unread>0? 'unread':''}`} onClick={()=>onSelectUser(u.id)}>
                <Avatar name={u.name} />
                <div className="uc-item-body">
                  <div className="uc-item-top">
                    <span className="uc-item-name">{u.name} {u.flagged && <span className="uc-flag">Bildirildi</span>}</span>
                    <span className="uc-item-time">
                      {u.lastTime}
                      {u.unread>0 && <span className="uc-unread">{u.unread}</span>}
                    </span>
                  </div>
                  <div className="uc-item-msg">{u.lastMsg}</div>
                </div>
                {u.online && <span className="uc-online" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Right thread */}
        <section className="uc-right">
          <div className="uc-right-header">
            <div className="uc-right-user">
              <Avatar name={selectedUser?.name} />
              <div>
                <div className="uc-right-name">{selectedUser?.name}</div>
              </div>
            </div>
            <button className="uc-report-btn" onClick={()=>setReportOpen(true)}>Sohbeti Bildir</button>
          </div>

          <div className="uc-day">Bugün</div>

          <div ref={threadRef} className="uc-thread">
            {currentThread.map(m => (
              <div key={m.id} className={`uc-bubble ${m.from==='agent' ? 'agent' : ''} ${m.from==='system'? 'system':''}`}>
                <div className={`uc-bubble-inner ${m.from==='system'?'uc-system':''}`}>
                  {m.text}
                  <div className="uc-time" aria-hidden>{m.ts ? new Date(m.ts).toLocaleTimeString().slice(0,5) : ''}</div>
                </div>
              </div>
            ))}
            {typing[selectedId] && (
              <div className="uc-typing">Yazıyor…</div>
            )}
          </div>

          <div className="uc-input">
            <input placeholder="Mesajınızı Giriniz..." value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} />
            <button className="uc-send" onClick={send} aria-label="Gönder" disabled={!text.trim()}>
              <img src="/icons/figma-button-icon.svg" alt="Gönder" />
            </button>
          </div>
        </section>
      </div>

      <ReportModal 
        open={reportOpen}
        onClose={()=>setReportOpen(false)} 
        onSubmit={onReportSubmit} 
        review={{ id: selectedId, tour: 'Sohbet' }}
        context="chat"
        chatName={selectedUser?.name}
      />
    </div>
  );
};

export default UserCommunication;
