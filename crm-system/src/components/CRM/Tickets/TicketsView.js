import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  brokerAddTicket,
  brokerUpdateTicket,
  brokerReplyTicket,
  brokerCloseTicket,
} from '../../../store/actions';
import './TicketsView.css';

const FILTER_TABS = ['All', 'Open', 'In Progress', 'Resolved'];
const AGENTS = ['Alice K.', 'Bob T.', 'Carol M.', 'David R.'];
const PRIORITIES = ['low', 'medium', 'high'];

const fmt = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const EMPTY_FORM = {
  clientId: '',
  clientName: '',
  subject: '',
  priority: 'medium',
  message: '',
};

const TicketsView = () => {
  const dispatch = useDispatch();
  const tickets = useSelector((s) => s.broker.tickets);

  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [assignAgent, setAssignAgent] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // ── Stats ──
  const open = tickets.filter((t) => t.status === 'open').length;
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;
  const highPriority = tickets.filter((t) => t.priority === 'high' && t.status !== 'resolved').length;

  // ── Filter + search ──
  const tabStatusMap = { All: null, Open: 'open', 'In Progress': 'in_progress', Resolved: 'resolved' };
  const filtered = tickets.filter((t) => {
    const statusMatch = !tabStatusMap[activeFilter] || t.status === tabStatusMap[activeFilter];
    const q = search.toLowerCase();
    const searchMatch =
      !q ||
      t.subject.toLowerCase().includes(q) ||
      t.clientName.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  // ── Handlers ──
  const handleReply = (ticketId) => {
    const text = (replyText[ticketId] || '').trim();
    if (!text) return;
    dispatch(
      brokerReplyTicket(ticketId, {
        author: 'Agent',
        text,
        isAgent: true,
      })
    );
    setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
  };

  const handleAssign = (ticketId) => {
    const agent = assignAgent[ticketId];
    if (!agent) return;
    dispatch(brokerUpdateTicket(ticketId, { assignedTo: agent }));
  };

  const handleMarkInProgress = (ticketId) => {
    dispatch(brokerUpdateTicket(ticketId, { status: 'in_progress' }));
  };

  const handleClose = (ticketId) => {
    dispatch(brokerCloseTicket(ticketId));
    if (expandedId === ticketId) setExpandedId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.clientId.trim()) return setFormError('Client ID is required.');
    if (!form.subject.trim()) return setFormError('Subject is required.');
    if (!form.message.trim()) return setFormError('Initial message is required.');

    dispatch(
      brokerAddTicket({
        clientId: form.clientId.trim(),
        clientName: form.clientName.trim() || form.clientId.trim(),
        subject: form.subject.trim(),
        priority: form.priority,
        replies: [
          {
            id: `r-new-${Date.now()}`,
            author: form.clientName.trim() || form.clientId.trim(),
            text: form.message.trim(),
            date: new Date().toISOString(),
            isAgent: false,
          },
        ],
      })
    );
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  const tabCount = (tab) => {
    if (tab === 'All') return tickets.length;
    return tickets.filter((t) => t.status === tabStatusMap[tab]).length;
  };

  return (
    <div className="view-container">
      {/* ── Header ── */}
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Support Tickets</h2>
          <span className="view-subtitle">Manage client support requests</span>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Ticket
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="view-stats tkt-stats">
        <div className="stat-card stat-card-info">
          <div className="stat-value info">{open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card stat-card-warn">
          <div className="stat-value warn">{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-value success">{resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card stat-card-danger">
          <div className="stat-value danger">{highPriority}</div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="view-toolbar">
        <div className="filter-tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              className={`filter-tab${activeFilter === tab ? ' active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab} <span className="tab-count">{tabCount(tab)}</span>
            </button>
          ))}
        </div>
        <input
          className="view-search"
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Ticket list ── */}
      <div className="tickets-list">
        {filtered.length === 0 && (
          <div className="tickets-empty">
            <span className="empty-icon">🎫</span>
            No tickets found.
          </div>
        )}
        {filtered.map((tkt) => {
          const isExpanded = expandedId === tkt.id;
          return (
            <div key={tkt.id} className={`ticket-card${isExpanded ? ' expanded' : ''}`}>
              {/* ── Ticket header row ── */}
              <div className="ticket-row" onClick={() => setExpandedId(isExpanded ? null : tkt.id)}>
                <div className="ticket-col-id">
                  <span className="tkt-id">{tkt.id}</span>
                </div>
                <div className="ticket-col-subject">
                  <span className="tkt-subject">{tkt.subject}</span>
                  <span className="tkt-client">{tkt.clientName}</span>
                </div>
                <div className="ticket-col-badges">
                  <span className={`badge badge-priority-${tkt.priority}`}>{tkt.priority}</span>
                  <span className={`badge badge-status-${tkt.status}`}>
                    {tkt.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="ticket-col-agent">
                  {tkt.assignedTo ? (
                    <span className="tkt-agent">👤 {tkt.assignedTo}</span>
                  ) : (
                    <span className="tkt-unassigned">Unassigned</span>
                  )}
                </div>
                <div className="ticket-col-dates">
                  <span className="tkt-date">📅 {fmt(tkt.createdAt)}</span>
                  <span className="tkt-date muted">↻ {fmt(tkt.updatedAt)}</span>
                </div>
                <div className="ticket-col-expand">
                  <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* ── Expanded conversation ── */}
              {isExpanded && (
                <div className="ticket-body">
                  <div className="conversation">
                    {tkt.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`message ${reply.isAgent ? 'message-agent' : 'message-client'}`}
                      >
                        <div className="message-header">
                          <span className="message-author">{reply.author}</span>
                          <span className="message-time">{fmtTime(reply.date)}</span>
                        </div>
                        <div className="message-text">{reply.text}</div>
                      </div>
                    ))}
                  </div>

                  {tkt.status !== 'resolved' && (
                    <div className="reply-form">
                      <textarea
                        className="reply-textarea"
                        placeholder="Type your reply…"
                        rows={3}
                        value={replyText[tkt.id] || ''}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [tkt.id]: e.target.value }))
                        }
                      />
                      <div className="reply-actions">
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => handleReply(tkt.id)}
                        >
                          Send Reply
                        </button>
                        {tkt.status === 'open' && (
                          <button
                            className="btn-warning btn-sm"
                            onClick={() => handleMarkInProgress(tkt.id)}
                          >
                            Mark In Progress
                          </button>
                        )}
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleClose(tkt.id)}
                        >
                          Close Ticket
                        </button>
                        <div className="assign-group">
                          <select
                            className="assign-select"
                            value={assignAgent[tkt.id] || ''}
                            onChange={(e) =>
                              setAssignAgent((prev) => ({ ...prev, [tkt.id]: e.target.value }))
                            }
                          >
                            <option value="">Reassign agent…</option>
                            {AGENTS.map((a) => (
                              <option key={a} value={a}>
                                {a}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => handleAssign(tkt.id)}
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── New Ticket Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>New Support Ticket</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form className="modal-body" onSubmit={handleAddSubmit}>
              {formError && <div className="form-error">{formError}</div>}

              <div className="form-row-2">
                <div className="form-row">
                  <label className="form-label">Client ID</label>
                  <input
                    className="form-input"
                    name="clientId"
                    value={form.clientId}
                    onChange={handleFormChange}
                    placeholder="CLT001"
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Client Name</label>
                  <input
                    className="form-input"
                    name="clientName"
                    value={form.clientName}
                    onChange={handleFormChange}
                    placeholder="Full name"
                  />
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Subject</label>
                <input
                  className="form-input"
                  name="subject"
                  value={form.subject}
                  onChange={handleFormChange}
                  placeholder="Ticket subject"
                />
              </div>
              <div className="form-row">
                <label className="form-label">Priority</label>
                <select
                  className="form-input"
                  name="priority"
                  value={form.priority}
                  onChange={handleFormChange}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Initial Message</label>
                <textarea
                  className="form-input"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleFormChange}
                  placeholder="Describe the issue…"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsView;
