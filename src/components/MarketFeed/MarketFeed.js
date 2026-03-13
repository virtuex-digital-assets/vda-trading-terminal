import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MarketFeed.css';

/* ── Static feed data ─────────────────────────────────────────────────────── */

const FEED_CARDS = [
  {
    id: 1,
    symbol: 'EUR/USD',
    direction: 'BUY',
    price: '1.08423',
    change: '+0.42%',
    positive: true,
    signalType: 'Breakout Signal',
    analyst: '@MarketHawk',
    avatar: '🦅',
    time: '2 min ago',
    description:
      'EUR/USD broke above key resistance at 1.0840. RSI momentum confirms bullish continuation. Next target: 1.0880.',
    tags: ['#forex', '#breakout', '#eurusd'],
    likes: 1247,
    comments: 84,
    bookmarks: 312,
    shares: 218,
    sparkline: [40, 38, 42, 39, 44, 47, 45, 50, 53, 55, 52, 58],
    gradient: ['#0d47a1', '#1565c0'],
    accent: '#42a5f5',
  },
  {
    id: 2,
    symbol: 'BTC/USD',
    direction: 'SELL',
    price: '67,210',
    change: '-1.83%',
    positive: false,
    signalType: 'Reversal Alert',
    analyst: '@CryptoVision',
    avatar: '🔮',
    time: '5 min ago',
    description:
      'Bitcoin rejected at $68,000 resistance for the third time. Bearish engulfing pattern on 4H chart. Watch for a pullback to $64,500.',
    tags: ['#bitcoin', '#crypto', '#reversal'],
    likes: 3891,
    comments: 256,
    bookmarks: 904,
    shares: 531,
    sparkline: [70, 72, 71, 74, 73, 69, 65, 63, 67, 65, 62, 60],
    gradient: ['#4a148c', '#6a1b9a'],
    accent: '#ce93d8',
  },
  {
    id: 3,
    symbol: 'GOLD',
    direction: 'BUY',
    price: '2,334.50',
    change: '+0.77%',
    positive: true,
    signalType: 'Safe Haven Flow',
    analyst: '@GoldBull',
    avatar: '🏆',
    time: '11 min ago',
    description:
      'Gold surging on geopolitical tensions. Inverse correlation with USD strengthening. Institutional buying confirmed above $2,320. Strong momentum toward $2,360.',
    tags: ['#gold', '#commodities', '#safehaven'],
    likes: 2156,
    comments: 147,
    bookmarks: 530,
    shares: 276,
    sparkline: [30, 32, 34, 31, 35, 38, 40, 42, 39, 44, 46, 48],
    gradient: ['#e65100', '#bf360c'],
    accent: '#ffcc02',
  },
  {
    id: 4,
    symbol: 'GBP/JPY',
    direction: 'SELL',
    price: '191.340',
    change: '-0.55%',
    positive: false,
    signalType: 'Overbought RSI',
    analyst: '@FX_Maestro',
    avatar: '🎯',
    time: '18 min ago',
    description:
      'GBP/JPY RSI hit 78 — deep overbought territory. MACD divergence appearing on 1H. Risk-off sentiment building across JPY pairs.',
    tags: ['#gbpjpy', '#rsi', '#forex'],
    likes: 897,
    comments: 63,
    bookmarks: 218,
    shares: 104,
    sparkline: [60, 62, 64, 66, 65, 63, 61, 59, 57, 55, 54, 52],
    gradient: ['#1b5e20', '#2e7d32'],
    accent: '#81c784',
  },
  {
    id: 5,
    symbol: 'S&P 500',
    direction: 'BUY',
    price: '5,241.0',
    change: '+0.31%',
    positive: true,
    signalType: 'Trend Continuation',
    analyst: '@WallStreetEdge',
    avatar: '📊',
    time: '24 min ago',
    description:
      'S&P 500 holding above 5,200 support — bullish structure intact. Tech sector leading gains. Q1 earnings season beat expectations by 8%. Watch 5,260 as next resistance.',
    tags: ['#sp500', '#stocks', '#usa'],
    likes: 5432,
    comments: 378,
    bookmarks: 1201,
    shares: 689,
    sparkline: [45, 43, 47, 48, 46, 49, 51, 50, 52, 54, 53, 56],
    gradient: ['#006064', '#00838f'],
    accent: '#4dd0e1',
  },
  {
    id: 6,
    symbol: 'USD/JPY',
    direction: 'BUY',
    price: '149.870',
    change: '+0.19%',
    positive: true,
    signalType: 'Carry Trade',
    analyst: '@MacroTrader',
    avatar: '🌐',
    time: '31 min ago',
    description:
      'USD/JPY carry trade back in play as Fed holds rates. BOJ signals no imminent hike. Watch for intervention risk above 151.00 — manage your size carefully.',
    tags: ['#usdjpy', '#carrytrade', '#forex'],
    likes: 1634,
    comments: 112,
    bookmarks: 445,
    shares: 203,
    sparkline: [50, 51, 52, 50, 53, 54, 52, 55, 56, 54, 57, 58],
    gradient: ['#37474f', '#455a64'],
    accent: '#b0bec5',
  },
];

/* ── Sparkline SVG ────────────────────────────────────────────────────────── */

const Sparkline = ({ data, positive, accent }) => {
  const w = 160;
  const h = 50;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;

  return (
    <svg width={w} height={h} className="sparkline-svg">
      <defs>
        <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${positive})`} />
      <polyline points={pts} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── Single card ──────────────────────────────────────────────────────────── */

const FeedCard = ({ card, active }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(card.likes);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = () => {
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const formatCount = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <div
      className={`feed-card${active ? ' feed-card--active' : ''}`}
      style={{ background: `linear-gradient(160deg, ${card.gradient[0]} 0%, ${card.gradient[1]} 100%)` }}
    >
      {/* ── Background glow ─── */}
      <div className="feed-card-glow" style={{ background: card.accent }} />

      {/* ── Main content ─── */}
      <div className="feed-card-content">
        {/* Signal badge */}
        <div className="feed-signal-badge" style={{ borderColor: card.accent, color: card.accent }}>
          {card.signalType}
        </div>

        {/* Symbol + price */}
        <div className="feed-symbol-row">
          <span className="feed-symbol">{card.symbol}</span>
          <span className={`feed-direction-tag feed-direction-tag--${card.direction.toLowerCase()}`}>
            {card.direction}
          </span>
        </div>

        <div className="feed-price-row">
          <span className="feed-price">{card.price}</span>
          <span className={`feed-change ${card.positive ? 'positive' : 'negative'}`}>
            {card.change}
          </span>
        </div>

        {/* Sparkline chart */}
        <div className="feed-chart">
          <Sparkline data={card.sparkline} positive={card.positive} accent={card.accent} />
        </div>

        {/* Description */}
        <p className="feed-description">{card.description}</p>

        {/* Tags */}
        <div className="feed-tags">
          {card.tags.map((t) => (
            <span key={t} className="feed-tag" style={{ color: card.accent }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Right action bar ─── */}
      <div className="feed-actions">
        <div className="feed-action-item">
          <button
            className={`feed-action-btn${liked ? ' liked' : ''}`}
            onClick={handleLike}
            aria-label="Like"
          >
            {liked ? '❤️' : '🤍'}
          </button>
          <span className="feed-action-count">{formatCount(likeCount)}</span>
        </div>

        <div className="feed-action-item">
          <button
            className={`feed-action-btn${showComment ? ' active' : ''}`}
            onClick={() => setShowComment((s) => !s)}
            aria-label="Comment"
          >
            💬
          </button>
          <span className="feed-action-count">{formatCount(card.comments)}</span>
        </div>

        <div className="feed-action-item">
          <button
            className={`feed-action-btn${saved ? ' saved' : ''}`}
            onClick={() => setSaved((s) => !s)}
            aria-label="Bookmark"
          >
            {saved ? '🔖' : '📌'}
          </button>
          <span className="feed-action-count">{formatCount(card.bookmarks)}</span>
        </div>

        <div className="feed-action-item">
          <button className="feed-action-btn" aria-label="Share">📤</button>
          <span className="feed-action-count">{formatCount(card.shares)}</span>
        </div>
      </div>

      {/* ── Bottom: analyst info + trade button ─── */}
      <div className="feed-bottom">
        <div className="feed-analyst">
          <span className="feed-analyst-avatar">{card.avatar}</span>
          <div className="feed-analyst-info">
            <span className="feed-analyst-name">{card.analyst}</span>
            <span className="feed-analyst-time">{card.time}</span>
          </div>
        </div>
        <button
          className="feed-trade-btn"
          style={{ background: card.accent, color: '#0a0a1a' }}
        >
          ⚡ Trade Now
        </button>
      </div>

      {/* ── Comment input overlay ─── */}
      {showComment && (
        <div className="feed-comment-overlay">
          <input
            className="feed-comment-input"
            placeholder="Add a comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && comment.trim()) {
                setComment('');
                setShowComment(false);
              }
            }}
            autoFocus
          />
          <button
            className="feed-comment-send"
            onClick={() => { setComment(''); setShowComment(false); }}
          >
            ↩
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Bottom navigation bar ────────────────────────────────────────────────── */

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home',    icon: '🏠', label: 'Feed'    },
    { id: 'explore', icon: '🔍', label: 'Explore' },
    { id: 'signals', icon: '⚡', label: 'Signals' },
    { id: 'inbox',   icon: '💬', label: 'Inbox'   },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className="feed-bottom-nav">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`feed-nav-btn${activeTab === t.id ? ' feed-nav-btn--active' : ''}`}
          onClick={() => onTabChange(t.id)}
        >
          <span className="feed-nav-icon">{t.icon}</span>
          <span className="feed-nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
};

/* ── Main MarketFeed component ────────────────────────────────────────────── */

const MarketFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const feedRef = useRef(null);

  /* Snap scroll: detect which card is centred */
  const onScroll = useCallback(() => {
    if (!feedRef.current) return;
    const el = feedRef.current;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex(idx);
  }, []);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowDown') {
        const next = Math.min(activeIndex + 1, FEED_CARDS.length - 1);
        feedRef.current?.scrollTo({ top: next * feedRef.current.clientHeight, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        const prev = Math.max(activeIndex - 1, 0);
        feedRef.current?.scrollTo({ top: prev * feedRef.current.clientHeight, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex]);

  return (
    <div className="market-feed-wrapper">
      {/* Progress dots */}
      <div className="feed-progress-dots">
        {FEED_CARDS.map((_, i) => (
          <button
            key={i}
            className={`feed-dot${i === activeIndex ? ' feed-dot--active' : ''}`}
            onClick={() =>
              feedRef.current?.scrollTo({ top: i * feedRef.current.clientHeight, behavior: 'smooth' })
            }
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll container */}
      <div className="feed-scroll-container" ref={feedRef}>
        {FEED_CARDS.map((card, i) => (
          <FeedCard key={card.id} card={card} active={i === activeIndex} />
        ))}
      </div>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default MarketFeed;
