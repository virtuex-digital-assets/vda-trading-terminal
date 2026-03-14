/**
 * Tickets – Support ticket system for traders.
 *
 * Features:
 *  • Create new support tickets with category and priority
 *  • View ticket list with status indicators
 *  • Reply to tickets (conversation thread)
 *  • Track resolution status
 */
import React, { useState, useEffect, useCallback } from 'react';
import backendBridge from '../../services/backendBridge';
import './Tickets.css';

const CATEGORIES = [
  { value: 'general',    label: '💬 General' },
  { value: 'deposit',    label: '💰 Deposit' },
  { value: 'withdrawal', label: '🏧 Withdrawal' },
  { value: 'technical',  label: '🔧 Technical' },
  { value: 'kyc',        label: '🪪 KYC / Verification' },
  { value: 'trading',    label: '📈 Trading' },
  { value: 'other',      label: '📌 Other' },
];

const PRIORITIES = [
  { value: 'low',    label: '🔵 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high',   label: '🟠 High' },
  { value: 'urgent', label: '🔴 Urgent' },
];

const STATUS_BADGE = {
  open:        { label: 'Open',        color: '#1a73e8' },
  in_progress: { label: 'In Progress', color: '#f39c12' },
  resolved:    { label: 'Resolved',    color: '#27ae60' },
  closed:      { label: 'Closed',      color: '#888'    },
};

const PRIORITY_COLOR = {
  low:    '#888',
  medium: '#f39c12',
  high:   '#e67e22',
  urgent: '#e74c3c',
};

export default function Tickets() {
  const [tickets,  setTickets]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState({ text: '', type: '' });
  const [view,     setView]     = useState('list'); // list | create | detail

  const [form, setForm] = useState({
    subject:  '',
    category: 'general',
    priority: 'medium',
    body:     '',
  });

  const [replyBody, setReplyBody] = useState('');

  const flash = (text, type = 'info') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const load = useCallback(async () => {
    if (!backendBridge.isConfigured()) return;
    setLoading(true);
    try {
      const data = await backendBridge.get('/tickets');
      setTickets(data.tickets || []);
    } catch (e) {
      flash(`Failed to load tickets: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTicket = useCallback(async (id) => {
    if (!backendBridge.isConfigured()) return;
    try {
      const data = await backendBridge.get(`/tickets/${id}`);
      setSelected(data.ticket);
    } catch (e) {
      flash(`Failed to load ticket: ${e.message}`, 'error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.subject.trim()) { flash('Subject is required.', 'error'); return; }
    if (!form.body.trim())    { flash('Message is required.', 'error'); return; }
    try {
      const data = await backendBridge.post('/tickets', form);
      flash('Ticket created! Our team will respond shortly.', 'success');
      setForm({ subject: '', category: 'general', priority: 'medium', body: '' });
      setView('list');
      load();
      setSelected(data.ticket);
      setView('detail');
    } catch (err) {
      flash(`Error: ${err.message}`, 'error');
    }
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!selected || !replyBody.trim()) return;
    try {
      const data = await backendBridge.post(`/tickets/${selected.id}/messages`, { body: replyBody });
      setSelected(data.ticket);
      setReplyBody('');
      load();
    } catch (err) {
      flash(`Error: ${err.message}`, 'error');
    }
  }

  const openTicket = (ticket) => {
    loadTicket(ticket.id);
    setView('detail');
  };

  if (!backendBridge.isConfigured()) {
    return (
      <div className="tickets-panel">
        <div className="panel-header">🎫 Support Tickets</div>
        <div className="tickets-demo-notice">
          <p>Support tickets are available when connected to the backend.</p>
          <p>Set <code>REACT_APP_API_URL</code> to connect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-panel">
      <div className="panel-header">
        🎫 Support Tickets
        <div className="tickets-header-actions">
          {view !== 'create' && (
            <button className="tickets-btn-new" onClick={() => setView('create')}>
              + New Ticket
            </button>
          )}
          {view !== 'list' && (
            <button className="tickets-btn-back" onClick={() => { setView('list'); setSelected(null); }}>
              ← Back
            </button>
          )}
        </div>
      </div>

      {msg.text && (
        <div className={`tickets-msg tickets-msg-${msg.type}`}>{msg.text}</div>
      )}

      {/* Create ticket form */}
      {view === 'create' && (
        <div className="tickets-create">
          <h3>Create New Ticket</h3>
          <form onSubmit={handleCreate} className="tickets-form">
            <label>Subject</label>
            <input
              type="text"
              placeholder="Brief description of your issue"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />

            <div className="tickets-form-row">
              <div>
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label>Message</label>
            <textarea
              rows="6"
              placeholder="Describe your issue in detail…"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />

            <button type="submit" className="tickets-btn-submit">
              📤 Submit Ticket
            </button>
          </form>
        </div>
      )}

      {/* Ticket detail / conversation */}
      {view === 'detail' && selected && (
        <div className="tickets-detail">
          <div className="tickets-detail-header">
            <div className="tickets-detail-subject">{selected.subject}</div>
            <div className="tickets-detail-meta">
              <span
                className="tickets-status-badge"
                style={{ color: STATUS_BADGE[selected.status]?.color }}
              >
                {STATUS_BADGE[selected.status]?.label}
              </span>
              <span
                className="tickets-priority-badge"
                style={{ color: PRIORITY_COLOR[selected.priority] }}
              >
                {PRIORITIES.find((p) => p.value === selected.priority)?.label}
              </span>
              <span className="tickets-category-badge">
                {CATEGORIES.find((c) => c.value === selected.category)?.label}
              </span>
              <span className="tickets-date">
                {new Date(selected.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="tickets-messages">
            {(selected.messages || []).map((m) => (
              <div
                key={m.id}
                className={`tickets-message tickets-message-${m.authorRole === 'client' ? 'client' : 'staff'}`}
              >
                <div className="tickets-message-header">
                  <span className="tickets-message-author">
                    {m.authorRole === 'client' ? '👤 You' : '🛟 Support Staff'}
                  </span>
                  <span className="tickets-message-time">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="tickets-message-body">{m.body}</div>
              </div>
            ))}
          </div>

          {selected.status !== 'closed' && (
            <form className="tickets-reply" onSubmit={handleReply}>
              <textarea
                rows="3"
                placeholder="Write a reply…"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
              />
              <button type="submit" className="tickets-btn-reply" disabled={!replyBody.trim()}>
                💬 Send Reply
              </button>
            </form>
          )}
        </div>
      )}

      {/* Ticket list */}
      {view === 'list' && (
        <div className="tickets-list-wrapper">
          {loading && <div className="tickets-loading">Loading…</div>}
          {!loading && tickets.length === 0 && (
            <div className="tickets-empty">
              <p>No support tickets yet.</p>
              <p>
                <button className="tickets-btn-new" onClick={() => setView('create')}>
                  Create your first ticket
                </button>
              </p>
            </div>
          )}
          <div className="tickets-list">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="tickets-list-item"
                onClick={() => openTicket(t)}
              >
                <div className="tickets-list-subject">{t.subject}</div>
                <div className="tickets-list-meta">
                  <span
                    className="tickets-status-badge"
                    style={{ color: STATUS_BADGE[t.status]?.color }}
                  >
                    {STATUS_BADGE[t.status]?.label}
                  </span>
                  <span
                    className="tickets-priority-badge"
                    style={{ color: PRIORITY_COLOR[t.priority] }}
                  >
                    {PRIORITIES.find((p) => p.value === t.priority)?.label || t.priority}
                  </span>
                  <span className="tickets-list-msgs">
                    💬 {(t.messages || []).length}
                  </span>
                  <span className="tickets-list-date">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
