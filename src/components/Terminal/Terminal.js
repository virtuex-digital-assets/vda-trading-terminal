import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearLog } from '../../store/actions';
import './Terminal.css';

const LEVEL_CLASS = { info: 'log-info', warn: 'log-warn', error: 'log-error', debug: 'log-debug' };

const Terminal = () => {
  const dispatch = useDispatch();
  const entries = useSelector((s) => s.terminal.entries);

  return (
    <div className="terminal-panel">
      <div className="panel-header">
        Terminal Log
        <button className="clear-btn" onClick={() => dispatch(clearLog())}>Clear</button>
      </div>
      <div className="terminal-body">
        {entries.map((e, i) => (
          <div key={i} className={`log-entry ${LEVEL_CLASS[e.level] || ''}`}>
            <span className="log-time">{new Date(e.time).toLocaleTimeString()}</span>
            <span className="log-level">[{(e.level || 'info').toUpperCase()}]</span>
            <span className="log-msg">{e.message}</span>
          </div>
        ))}
        {entries.length === 0 && <div className="log-empty">No log entries.</div>}
      </div>
    </div>
  );
};

export default Terminal;
