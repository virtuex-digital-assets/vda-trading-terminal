import {
  CRM_SET_VIEW,
  CRM_SELECT_CLIENT,
  CRM_ADD_CLIENT,
  CRM_UPDATE_CLIENT,
  CRM_SET_SEARCH,
  CRM_SET_STAGE_FILTER,
  CRM_ADD_NOTE,
  CRM_ADD_TRANSACTION,
} from '../actions/actionTypes';

// ── Seed data ──────────────────────────────────────────────────────────────

const SEED_CLIENTS = [
  {
    id: 'CLT001',
    firstName: 'James', lastName: 'Morrison',
    email: 'j.morrison@proton.me', phone: '+44 7700 900123',
    country: 'United Kingdom',
    stage: 'Active', kycStatus: 'verified',
    balance: 18450.20, totalDeposits: 25000, totalWithdrawals: 6500, openPL: 342.50,
    accounts: ['7100001'],
    assignedTo: 'Alice K.',
    createdAt: '2025-01-10T09:00:00Z', lastActivity: '2026-03-04T11:20:00Z',
    notes: [
      { id: 'n1', text: 'Very interested in crypto pairs.', date: '2025-02-01T10:00:00Z', author: 'Alice K.' },
    ],
    transactions: [
      { id: 't1', type: 'Deposit',    amount: 10000, date: '2025-01-15T09:00:00Z', status: 'completed' },
      { id: 't2', type: 'Deposit',    amount: 15000, date: '2025-02-01T10:00:00Z', status: 'completed' },
      { id: 't3', type: 'Withdrawal', amount: 6500,  date: '2025-03-01T10:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT002',
    firstName: 'Sarah', lastName: 'Chen',
    email: 's.chen@gmail.com', phone: '+65 9123 4567',
    country: 'Singapore',
    stage: 'Active', kycStatus: 'verified',
    balance: 52300.00, totalDeposits: 60000, totalWithdrawals: 8000, openPL: -1250.00,
    accounts: ['7100002', '7100003'],
    assignedTo: 'Bob T.',
    createdAt: '2024-11-20T08:00:00Z', lastActivity: '2026-03-05T08:00:00Z',
    notes: [],
    transactions: [
      { id: 't4', type: 'Deposit',    amount: 30000, date: '2024-12-01T09:00:00Z', status: 'completed' },
      { id: 't5', type: 'Deposit',    amount: 30000, date: '2025-01-10T09:00:00Z', status: 'completed' },
      { id: 't6', type: 'Withdrawal', amount: 8000,  date: '2025-06-01T09:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT003',
    firstName: 'Mohammed', lastName: 'Al-Rashid',
    email: 'm.rashid@gmail.com', phone: '+971 50 123 4567',
    country: 'UAE',
    stage: 'Funded', kycStatus: 'verified',
    balance: 5000, totalDeposits: 5000, totalWithdrawals: 0, openPL: 0,
    accounts: ['7100004'],
    assignedTo: 'Alice K.',
    createdAt: '2025-12-01T08:00:00Z', lastActivity: '2026-02-20T09:00:00Z',
    notes: [
      { id: 'n2', text: 'Follow up re gold trading strategy.', date: '2026-01-15T10:00:00Z', author: 'Alice K.' },
    ],
    transactions: [
      { id: 't7', type: 'Deposit', amount: 5000, date: '2025-12-15T09:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT004',
    firstName: 'Elena', lastName: 'Vasquez',
    email: 'elena.v@outlook.com', phone: '+34 612 345 678',
    country: 'Spain',
    stage: 'KYC Verified', kycStatus: 'verified',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Carol M.',
    createdAt: '2026-01-05T10:00:00Z', lastActivity: '2026-02-28T14:00:00Z',
    notes: [
      { id: 'n3', text: 'KYC approved — schedule deposit call.', date: '2026-02-28T14:00:00Z', author: 'Carol M.' },
    ],
    transactions: [],
  },
  {
    id: 'CLT005',
    firstName: 'David', lastName: 'Nakamura',
    email: 'd.nakamura@mail.com', phone: '+81 90 1234 5678',
    country: 'Japan',
    stage: 'KYC Submitted', kycStatus: 'submitted',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Bob T.',
    createdAt: '2026-02-10T08:00:00Z', lastActivity: '2026-03-01T09:30:00Z',
    notes: [],
    transactions: [],
  },
  {
    id: 'CLT006',
    firstName: 'Amara', lastName: 'Obi',
    email: 'a.obi@yahoo.com', phone: '+234 801 234 5678',
    country: 'Nigeria',
    stage: 'Contacted', kycStatus: 'pending',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Alice K.',
    createdAt: '2026-02-20T10:00:00Z', lastActivity: '2026-03-03T11:00:00Z',
    notes: [
      { id: 'n4', text: 'Called — very interested, sending KYC docs.', date: '2026-03-03T11:00:00Z', author: 'Alice K.' },
    ],
    transactions: [],
  },
  {
    id: 'CLT007',
    firstName: 'Lucas', lastName: 'Weber',
    email: 'l.weber@gmx.de', phone: '+49 170 1234567',
    country: 'Germany',
    stage: 'New Lead', kycStatus: 'pending',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Carol M.',
    createdAt: '2026-03-01T08:00:00Z', lastActivity: '2026-03-01T08:00:00Z',
    notes: [],
    transactions: [],
  },
  {
    id: 'CLT008',
    firstName: 'Priya', lastName: 'Sharma',
    email: 'priya.s@gmail.com', phone: '+91 98765 43210',
    country: 'India',
    stage: 'Inactive', kycStatus: 'verified',
    balance: 1200, totalDeposits: 3000, totalWithdrawals: 1800, openPL: 0,
    accounts: ['7100005'],
    assignedTo: 'Bob T.',
    createdAt: '2024-08-15T09:00:00Z', lastActivity: '2025-09-10T10:00:00Z',
    notes: [
      { id: 'n5', text: 'No response to 3 calls — mark inactive.', date: '2025-09-10T10:00:00Z', author: 'Bob T.' },
    ],
    transactions: [
      { id: 't8', type: 'Deposit',    amount: 3000, date: '2024-09-01T09:00:00Z', status: 'completed' },
      { id: 't9', type: 'Withdrawal', amount: 1800, date: '2025-07-01T09:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT009',
    firstName: 'Oliver', lastName: 'Brown',
    email: 'o.brown@mail.co.uk', phone: '+44 7911 123456',
    country: 'United Kingdom',
    stage: 'Active', kycStatus: 'verified',
    balance: 9800, totalDeposits: 15000, totalWithdrawals: 5200, openPL: 650.00,
    accounts: ['7100006'],
    assignedTo: 'Alice K.',
    createdAt: '2025-03-01T09:00:00Z', lastActivity: '2026-03-04T15:00:00Z',
    notes: [],
    transactions: [
      { id: 't10', type: 'Deposit',    amount: 15000, date: '2025-03-10T09:00:00Z', status: 'completed' },
      { id: 't11', type: 'Withdrawal', amount: 5200,  date: '2025-12-01T09:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT010',
    firstName: 'Sofia', lastName: 'Andersen',
    email: 'sofia.a@hotmail.com', phone: '+45 51 23 45 67',
    country: 'Denmark',
    stage: 'New Lead', kycStatus: 'pending',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Carol M.',
    createdAt: '2026-03-04T14:00:00Z', lastActivity: '2026-03-04T14:00:00Z',
    notes: [],
    transactions: [],
  },
];

// ── Initial state ──────────────────────────────────────────────────────────

const initialState = {
  activeView: 'dashboard',   // 'dashboard' | 'clients' | 'pipeline'
  selectedClientId: null,
  clients: SEED_CLIENTS,
  searchQuery: '',
  stageFilter: 'All',
};

// ── Helpers ────────────────────────────────────────────────────────────────

let nextClientNum = SEED_CLIENTS.length + 1;

// ── Reducer ────────────────────────────────────────────────────────────────

const crmReducer = (state = initialState, action) => {
  switch (action.type) {
    case CRM_SET_VIEW:
      return { ...state, activeView: action.payload, selectedClientId: null };

    case CRM_SELECT_CLIENT:
      return { ...state, selectedClientId: action.payload, activeView: 'clients' };

    case CRM_SET_SEARCH:
      return { ...state, searchQuery: action.payload };

    case CRM_SET_STAGE_FILTER:
      return { ...state, stageFilter: action.payload };

    case CRM_ADD_CLIENT: {
      const id = `CLT${String(nextClientNum++).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const newClient = {
        id,
        firstName: action.payload.firstName || '',
        lastName: action.payload.lastName || '',
        email: action.payload.email || '',
        phone: action.payload.phone || '',
        country: action.payload.country || '',
        stage: 'New Lead',
        kycStatus: 'pending',
        balance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        openPL: 0,
        accounts: [],
        assignedTo: action.payload.assignedTo || '',
        createdAt: now,
        lastActivity: now,
        notes: [],
        transactions: [],
      };
      return { ...state, clients: [...state.clients, newClient], selectedClientId: id, activeView: 'clients' };
    }

    case CRM_UPDATE_CLIENT:
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.changes, lastActivity: new Date().toISOString() }
            : c
        ),
      };

    case CRM_ADD_NOTE:
      return {
        ...state,
        clients: state.clients.map((c) => {
          if (c.id !== action.payload.clientId) return c;
          const note = {
            id: `note-${Date.now()}`,
            text: action.payload.text,
            date: new Date().toISOString(),
            author: action.payload.author || 'Agent',
          };
          return { ...c, notes: [note, ...c.notes], lastActivity: note.date };
        }),
      };

    case CRM_ADD_TRANSACTION:
      return {
        ...state,
        clients: state.clients.map((c) => {
          if (c.id !== action.payload.clientId) return c;
          const tx = {
            id: `tx-${Date.now()}`,
            type: action.payload.txType,
            amount: action.payload.amount,
            date: new Date().toISOString(),
            status: 'completed',
          };
          const totalDeposits = tx.type === 'Deposit'
            ? c.totalDeposits + tx.amount
            : c.totalDeposits;
          const totalWithdrawals = tx.type === 'Withdrawal'
            ? c.totalWithdrawals + tx.amount
            : c.totalWithdrawals;
          const balance = parseFloat((totalDeposits - totalWithdrawals).toFixed(2));
          return {
            ...c,
            transactions: [tx, ...c.transactions],
            totalDeposits,
            totalWithdrawals,
            balance,
            lastActivity: tx.date,
          };
        }),
      };

    default:
      return state;
  }
};

export default crmReducer;
