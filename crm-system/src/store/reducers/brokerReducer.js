import {
  BROKER_SET_VIEW,
  BROKER_APPROVE_KYC,
  BROKER_REJECT_KYC,
  BROKER_REQUEST_KYC_DOCS,
  BROKER_CREATE_TRADING_ACCOUNT,
  BROKER_UPDATE_TRADING_ACCOUNT,
  BROKER_DISABLE_TRADING_ACCOUNT,
  BROKER_ADD_AFFILIATE,
  BROKER_UPDATE_AFFILIATE,
  BROKER_ADD_TICKET,
  BROKER_UPDATE_TICKET,
  BROKER_REPLY_TICKET,
  BROKER_CLOSE_TICKET,
  BROKER_ADD_NOTIFICATION,
  BROKER_DISMISS_NOTIFICATION,
  BROKER_DISMISS_ALL_NOTIFICATIONS,
  BROKER_UPDATE_SETTINGS,
} from '../actions/actionTypes';

const SEED_KYC = [
  { id: 'KYC001', clientId: 'CLT005', clientName: 'David Nakamura', type: 'passport', status: 'pending', submittedAt: '2026-03-01T09:00:00Z', country: 'Japan', notes: '' },
  { id: 'KYC002', clientId: 'CLT005', clientName: 'David Nakamura', type: 'proof_of_address', status: 'pending', submittedAt: '2026-03-01T09:05:00Z', country: 'Japan', notes: '' },
  { id: 'KYC003', clientId: 'CLT006', clientName: 'Amara Obi', type: 'passport', status: 'pending', submittedAt: '2026-03-04T10:00:00Z', country: 'Nigeria', notes: '' },
  { id: 'KYC004', clientId: 'CLT001', clientName: 'James Morrison', type: 'passport', status: 'approved', submittedAt: '2025-01-12T09:00:00Z', country: 'United Kingdom', notes: 'Verified', approvedAt: '2025-01-14T10:00:00Z' },
  { id: 'KYC005', clientId: 'CLT002', clientName: 'Sarah Chen', type: 'passport', status: 'approved', submittedAt: '2024-11-25T08:00:00Z', country: 'Singapore', notes: 'Verified', approvedAt: '2024-11-27T10:00:00Z' },
  { id: 'KYC006', clientId: 'CLT002', clientName: 'Sarah Chen', type: 'proof_of_address', status: 'approved', submittedAt: '2024-11-25T08:10:00Z', country: 'Singapore', notes: 'Verified', approvedAt: '2024-11-27T10:05:00Z' },
  { id: 'KYC007', clientId: 'CLT007', clientName: 'Lucas Weber', type: 'drivers_license', status: 'pending', submittedAt: '2026-03-05T08:00:00Z', country: 'Germany', notes: '' },
  { id: 'KYC008', clientId: 'CLT004', clientName: 'Elena Vasquez', type: 'passport', status: 'approved', submittedAt: '2026-01-10T10:00:00Z', country: 'Spain', notes: 'Verified', approvedAt: '2026-01-12T09:00:00Z' },
];

const SEED_ACCOUNTS = [
  { id: '7100001', clientId: 'CLT001', clientName: 'James Morrison', login: '7100001', password: '****', server: 'VDA-Live', leverage: 100, balance: 18450.20, equity: 18792.70, margin: 184.50, freeMargin: 18608.20, status: 'active', currency: 'USD', type: 'Standard', createdAt: '2025-01-15T09:00:00Z' },
  { id: '7100002', clientId: 'CLT002', clientName: 'Sarah Chen', login: '7100002', password: '****', server: 'VDA-Live', leverage: 200, balance: 30000.00, equity: 28750.00, margin: 1250.00, freeMargin: 27500.00, status: 'active', currency: 'USD', type: 'Pro', createdAt: '2024-12-01T09:00:00Z' },
  { id: '7100003', clientId: 'CLT002', clientName: 'Sarah Chen', login: '7100003', password: '****', server: 'VDA-Live', leverage: 50, balance: 22300.00, equity: 22300.00, margin: 0, freeMargin: 22300.00, status: 'active', currency: 'USD', type: 'Islamic', createdAt: '2025-01-10T09:00:00Z' },
  { id: '7100004', clientId: 'CLT003', clientName: 'Mohammed Al-Rashid', login: '7100004', password: '****', server: 'VDA-Live', leverage: 100, balance: 5000.00, equity: 5000.00, margin: 0, freeMargin: 5000.00, status: 'active', currency: 'USD', type: 'Standard', createdAt: '2025-12-15T09:00:00Z' },
  { id: '7100005', clientId: 'CLT008', clientName: 'Priya Sharma', login: '7100005', password: '****', server: 'VDA-Live', leverage: 100, balance: 1200.00, equity: 1200.00, margin: 0, freeMargin: 1200.00, status: 'disabled', currency: 'USD', type: 'Standard', createdAt: '2024-08-15T09:00:00Z' },
  { id: '7100006', clientId: 'CLT009', clientName: 'Oliver Brown', login: '7100006', password: '****', server: 'VDA-Live', leverage: 100, balance: 9800.00, equity: 10450.00, margin: 98.00, freeMargin: 10352.00, status: 'active', currency: 'USD', type: 'Standard', createdAt: '2025-03-10T09:00:00Z' },
  { id: '7100007', clientId: 'CLT003', clientName: 'Mohammed Al-Rashid', login: '7100007', password: '****', server: 'VDA-Demo', leverage: 100, balance: 10000.00, equity: 10000.00, margin: 0, freeMargin: 10000.00, status: 'active', currency: 'USD', type: 'Demo', createdAt: '2025-11-01T09:00:00Z' },
  { id: '7100008', clientId: 'CLT001', clientName: 'James Morrison', login: '7100008', password: '****', server: 'VDA-Demo', leverage: 200, balance: 50000.00, equity: 50000.00, margin: 0, freeMargin: 50000.00, status: 'active', currency: 'USD', type: 'Demo', createdAt: '2024-12-20T09:00:00Z' },
];

const SEED_AFFILIATES = [
  { id: 'IB001', name: 'TradeMax Partners', contactEmail: 'ib@trademax.com', level: 1, parentId: null, referralCode: 'TM2024', referredClients: ['CLT001', 'CLT002', 'CLT009'], totalVolume: 4280000, commissionRate: 0.015, totalCommission: 6420.00, pendingCommission: 320.00, paidCommission: 6100.00, status: 'active', createdAt: '2024-06-01T09:00:00Z' },
  { id: 'IB002', name: 'ForexLeads Dubai', contactEmail: 'partners@forexleads.ae', level: 1, parentId: null, referralCode: 'FL2024', referredClients: ['CLT003', 'CLT006'], totalVolume: 850000, commissionRate: 0.012, totalCommission: 1020.00, pendingCommission: 180.00, paidCommission: 840.00, status: 'active', createdAt: '2024-09-15T09:00:00Z' },
  { id: 'IB003', name: 'AsiaFX Network', contactEmail: 'ib@asiafx.com', level: 2, parentId: 'IB001', referralCode: 'AF2024', referredClients: ['CLT005'], totalVolume: 120000, commissionRate: 0.008, totalCommission: 96.00, pendingCommission: 96.00, paidCommission: 0, status: 'active', createdAt: '2025-01-10T09:00:00Z' },
  { id: 'IB004', name: 'EuroCapital IB', contactEmail: 'ib@eurocapital.eu', level: 1, parentId: null, referralCode: 'EC2024', referredClients: ['CLT004', 'CLT007', 'CLT010'], totalVolume: 0, commissionRate: 0.01, totalCommission: 0, pendingCommission: 0, paidCommission: 0, status: 'pending', createdAt: '2026-01-15T09:00:00Z' },
];

const SEED_TICKETS = [
  { id: 'TKT001', clientId: 'CLT001', clientName: 'James Morrison', subject: 'Withdrawal not received', priority: 'high', status: 'open', assignedTo: 'Alice K.', createdAt: '2026-03-10T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z', replies: [{ id: 'r1', author: 'James Morrison', text: 'I submitted a withdrawal of $1000 on March 8 but have not received it yet.', date: '2026-03-10T10:00:00Z', isAgent: false }] },
  { id: 'TKT002', clientId: 'CLT002', clientName: 'Sarah Chen', subject: 'Account leverage change request', priority: 'medium', status: 'in_progress', assignedTo: 'Bob T.', createdAt: '2026-03-08T09:00:00Z', updatedAt: '2026-03-09T11:00:00Z', replies: [{ id: 'r2', author: 'Sarah Chen', text: 'Please change my account 7100002 leverage from 200 to 500.', date: '2026-03-08T09:00:00Z', isAgent: false }, { id: 'r3', author: 'Bob T.', text: 'We are processing your request and will notify you within 24 hours.', date: '2026-03-09T11:00:00Z', isAgent: true }] },
  { id: 'TKT003', clientId: 'CLT003', clientName: 'Mohammed Al-Rashid', subject: 'Islamic account request', priority: 'medium', status: 'resolved', assignedTo: 'Alice K.', createdAt: '2026-02-15T08:00:00Z', updatedAt: '2026-02-16T10:00:00Z', replies: [{ id: 'r4', author: 'Mohammed Al-Rashid', text: 'I need to convert my account to Islamic (swap-free).', date: '2026-02-15T08:00:00Z', isAgent: false }, { id: 'r5', author: 'Alice K.', text: 'Your account has been converted to Islamic. No swaps will be charged.', date: '2026-02-16T10:00:00Z', isAgent: true }] },
  { id: 'TKT004', clientId: 'CLT009', clientName: 'Oliver Brown', subject: 'Unable to login to trading platform', priority: 'high', status: 'open', assignedTo: 'Carol M.', createdAt: '2026-03-12T14:00:00Z', updatedAt: '2026-03-12T14:00:00Z', replies: [{ id: 'r6', author: 'Oliver Brown', text: 'I am getting an invalid password error when trying to login. Please reset my credentials.', date: '2026-03-12T14:00:00Z', isAgent: false }] },
  { id: 'TKT005', clientId: 'CLT008', clientName: 'Priya Sharma', subject: 'Account reactivation', priority: 'low', status: 'open', assignedTo: null, createdAt: '2026-03-13T09:00:00Z', updatedAt: '2026-03-13T09:00:00Z', replies: [{ id: 'r7', author: 'Priya Sharma', text: 'I would like to reactivate my trading account.', date: '2026-03-13T09:00:00Z', isAgent: false }] },
  { id: 'TKT006', clientId: 'CLT004', clientName: 'Elena Vasquez', subject: 'KYC document resubmission', priority: 'low', status: 'resolved', assignedTo: 'Carol M.', createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-22T09:00:00Z', replies: [{ id: 'r8', author: 'Elena Vasquez', text: 'How do I resubmit my proof of address?', date: '2026-01-20T10:00:00Z', isAgent: false }, { id: 'r9', author: 'Carol M.', text: 'Please upload your document via the KYC portal. Your previous submission is still under review.', date: '2026-01-22T09:00:00Z', isAgent: true }] },
];

const SEED_NOTIFICATIONS = [
  { id: 'NTF001', type: 'kyc', message: 'New KYC submission from David Nakamura (CLT005)', date: '2026-03-01T09:00:00Z', read: false, link: 'kyc' },
  { id: 'NTF002', type: 'deposit', message: 'Deposit of $5,000 completed for Mohammed Al-Rashid', date: '2026-02-15T10:00:00Z', read: false, link: 'wallets' },
  { id: 'NTF003', type: 'ticket', message: 'New support ticket from James Morrison: Withdrawal not received', date: '2026-03-10T10:00:00Z', read: false, link: 'tickets' },
  { id: 'NTF004', type: 'kyc', message: 'New KYC submission from Amara Obi (CLT006)', date: '2026-03-04T10:00:00Z', read: true, link: 'kyc' },
  { id: 'NTF005', type: 'withdrawal', message: 'Withdrawal request of $1,000 pending approval from James Morrison', date: '2026-03-08T09:00:00Z', read: false, link: 'wallets' },
];

const INITIAL_SETTINGS = {
  brokerName: 'VDA Markets',
  brokerLogo: '🏦',
  currency: 'USD',
  defaultLeverage: 100,
  maxLeverage: 500,
  minDeposit: 100,
  supportEmail: 'support@vda.trade',
  timezone: 'UTC',
  theme: 'dark',
};

const initialState = {
  activeView: 'dashboard',
  kycDocuments: SEED_KYC,
  tradingAccounts: SEED_ACCOUNTS,
  affiliates: SEED_AFFILIATES,
  tickets: SEED_TICKETS,
  notifications: SEED_NOTIFICATIONS,
  settings: INITIAL_SETTINGS,
  nextIds: {
    kyc: 9,
    account: 7100009,
    affiliate: 5,
    ticket: 7,
    notification: 6,
    reply: 10,
  },
};

const brokerReducer = (state = initialState, action) => {
  switch (action.type) {
    case BROKER_SET_VIEW:
      return { ...state, activeView: action.payload };

    // --- KYC ---
    case BROKER_APPROVE_KYC:
      return {
        ...state,
        kycDocuments: state.kycDocuments.map((doc) =>
          doc.id === action.payload
            ? { ...doc, status: 'approved', approvedAt: new Date().toISOString(), notes: doc.notes || 'Verified' }
            : doc
        ),
      };

    case BROKER_REJECT_KYC:
      return {
        ...state,
        kycDocuments: state.kycDocuments.map((doc) =>
          doc.id === action.payload.docId
            ? { ...doc, status: 'rejected', rejectedAt: new Date().toISOString(), notes: action.payload.reason }
            : doc
        ),
      };

    case BROKER_REQUEST_KYC_DOCS: {
      const kycNum = state.nextIds.kyc;
      const kycId = `KYC${String(kycNum).padStart(3, '0')}`;
      return {
        ...state,
        nextIds: { ...state.nextIds, kyc: kycNum + 1 },
        kycDocuments: state.kycDocuments.map((doc) =>
          doc.id === action.payload.docId
            ? { ...doc, status: 'requested', requestId: kycId, requestNotes: action.payload.notes }
            : doc
        ),
      };
    }

    // --- Trading Accounts ---
    case BROKER_CREATE_TRADING_ACCOUNT: {
      const accountNum = state.nextIds.account;
      const accountId = String(accountNum);
      const newAccount = {
        password: '****',
        server: 'VDA-Live',
        balance: 0,
        equity: 0,
        margin: 0,
        freeMargin: 0,
        status: 'active',
        currency: 'USD',
        createdAt: new Date().toISOString(),
        ...action.payload,
        id: accountId,
        login: accountId,
      };
      return {
        ...state,
        nextIds: { ...state.nextIds, account: accountNum + 1 },
        tradingAccounts: [...state.tradingAccounts, newAccount],
      };
    }

    case BROKER_UPDATE_TRADING_ACCOUNT:
      return {
        ...state,
        tradingAccounts: state.tradingAccounts.map((acct) =>
          acct.id === action.payload.id ? { ...acct, ...action.payload.changes } : acct
        ),
      };

    case BROKER_DISABLE_TRADING_ACCOUNT:
      return {
        ...state,
        tradingAccounts: state.tradingAccounts.map((acct) =>
          acct.id === action.payload ? { ...acct, status: 'disabled' } : acct
        ),
      };

    // --- Affiliates ---
    case BROKER_ADD_AFFILIATE: {
      const affiliateNum = state.nextIds.affiliate;
      const affiliateId = `IB${String(affiliateNum).padStart(3, '0')}`;
      const newAffiliate = {
        level: 1,
        parentId: null,
        referredClients: [],
        totalVolume: 0,
        totalCommission: 0,
        pendingCommission: 0,
        paidCommission: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...action.payload,
        id: affiliateId,
      };
      return {
        ...state,
        nextIds: { ...state.nextIds, affiliate: affiliateNum + 1 },
        affiliates: [...state.affiliates, newAffiliate],
      };
    }

    case BROKER_UPDATE_AFFILIATE:
      return {
        ...state,
        affiliates: state.affiliates.map((aff) =>
          aff.id === action.payload.id ? { ...aff, ...action.payload.changes } : aff
        ),
      };

    // --- Tickets ---
    case BROKER_ADD_TICKET: {
      const ticketNum = state.nextIds.ticket;
      const ticketId = `TKT${String(ticketNum).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const newTicket = {
        priority: 'medium',
        status: 'open',
        assignedTo: null,
        replies: [],
        ...action.payload,
        id: ticketId,
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...state,
        nextIds: { ...state.nextIds, ticket: ticketNum + 1 },
        tickets: [...state.tickets, newTicket],
      };
    }

    case BROKER_UPDATE_TICKET:
      return {
        ...state,
        tickets: state.tickets.map((tkt) =>
          tkt.id === action.payload.id
            ? { ...tkt, ...action.payload.changes, updatedAt: new Date().toISOString() }
            : tkt
        ),
      };

    case BROKER_REPLY_TICKET: {
      const replyNum = state.nextIds.reply;
      const replyId = `r${replyNum}`;
      const replyDate = new Date().toISOString();
      return {
        ...state,
        nextIds: { ...state.nextIds, reply: replyNum + 1 },
        tickets: state.tickets.map((tkt) =>
          tkt.id === action.payload.id
            ? {
                ...tkt,
                replies: [...tkt.replies, { id: replyId, date: replyDate, ...action.payload.reply }],
                updatedAt: replyDate,
              }
            : tkt
        ),
      };
    }

    case BROKER_CLOSE_TICKET:
      return {
        ...state,
        tickets: state.tickets.map((tkt) =>
          tkt.id === action.payload
            ? { ...tkt, status: 'resolved', updatedAt: new Date().toISOString() }
            : tkt
        ),
      };

    // --- Notifications ---
    case BROKER_ADD_NOTIFICATION: {
      const notifNum = state.nextIds.notification;
      const notifId = `NTF${String(notifNum).padStart(3, '0')}`;
      const newNotif = {
        date: new Date().toISOString(),
        read: false,
        ...action.payload,
        id: notifId,
      };
      return {
        ...state,
        nextIds: { ...state.nextIds, notification: notifNum + 1 },
        notifications: [newNotif, ...state.notifications],
      };
    }

    case BROKER_DISMISS_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    case BROKER_DISMISS_ALL_NOTIFICATIONS:
      return { ...state, notifications: [] };

    // --- Settings ---
    case BROKER_UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };

    default:
      return state;
  }
};

export default brokerReducer;
