import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  brokerDismissNotification,
  brokerDismissAllNotifications,
  crmSetView,
} from '../../../store/actions';
import './NotificationCenter.css';

const TYPE_ICONS = {
  kyc:        '🔍',
  deposit:    '💰',
  withdrawal: '💸',
  ticket:     '🎫',
  system:     '🔔',
};

function relativeDate(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((s) => s.broker.notifications);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleNotifClick = (notif) => {
    if (notif.link) {
      dispatch(crmSetView(notif.link));
    }
    setOpen(false);
  };

  return (
    <div className="notif-center" ref={panelRef}>
      <button
        className={`notif-bell-btn${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>Notifications</span>
            <div className="notif-panel-actions">
              <button
                className="notif-action-btn"
                onClick={() => dispatch(brokerDismissAllNotifications())}
              >
                Dismiss all
              </button>
            </div>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item${notif.read ? '' : ' unread'}`}
                  onClick={() => handleNotifClick(notif)}
                >
                  <span className="notif-icon">
                    {TYPE_ICONS[notif.type] || TYPE_ICONS.system}
                  </span>
                  <div className="notif-content">
                    <div className="notif-message">{notif.message}</div>
                    <div className="notif-date">{relativeDate(notif.date)}</div>
                  </div>
                  {!notif.read && <span className="notif-dot" />}
                  <button
                    className="notif-dismiss"
                    title="Dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(brokerDismissNotification(notif.id));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
