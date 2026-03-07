import crmReducer from '../store/reducers/crmReducer';
import {
  CRM_SET_VIEW,
  CRM_SELECT_CLIENT,
  CRM_ADD_CLIENT,
  CRM_UPDATE_CLIENT,
  CRM_SET_SEARCH,
  CRM_SET_STAGE_FILTER,
  CRM_ADD_NOTE,
  CRM_ADD_TRANSACTION,
  CRM_DELETE_CLIENT,
  CRM_SET_REP_FILTER,
} from '../store/actions/actionTypes';

describe('crmReducer', () => {
  const initial = crmReducer(undefined, {});

  it('returns default state', () => {
    expect(initial.activeView).toBe('dashboard');
    expect(initial.selectedClientId).toBeNull();
    expect(Array.isArray(initial.clients)).toBe(true);
    expect(initial.clients.length).toBeGreaterThan(0);
    expect(initial.searchQuery).toBe('');
    expect(initial.stageFilter).toBe('All');
    expect(initial.repFilter).toBe('All');
  });

  it('handles CRM_SET_VIEW', () => {
    const state = crmReducer(initial, { type: CRM_SET_VIEW, payload: 'clients' });
    expect(state.activeView).toBe('clients');
    expect(state.selectedClientId).toBeNull();
  });

  it('CRM_SET_VIEW resets selectedClientId', () => {
    const withSelected = { ...initial, selectedClientId: 'CLT001' };
    const state = crmReducer(withSelected, { type: CRM_SET_VIEW, payload: 'pipeline' });
    expect(state.selectedClientId).toBeNull();
  });

  it('handles CRM_SELECT_CLIENT', () => {
    const state = crmReducer(initial, { type: CRM_SELECT_CLIENT, payload: 'CLT002' });
    expect(state.selectedClientId).toBe('CLT002');
    expect(state.activeView).toBe('clients');
  });

  it('handles CRM_SET_SEARCH', () => {
    const state = crmReducer(initial, { type: CRM_SET_SEARCH, payload: 'James' });
    expect(state.searchQuery).toBe('James');
  });

  it('handles CRM_SET_STAGE_FILTER', () => {
    const state = crmReducer(initial, { type: CRM_SET_STAGE_FILTER, payload: 'Active' });
    expect(state.stageFilter).toBe('Active');
  });

  it('handles CRM_ADD_CLIENT', () => {
    const payload = {
      firstName: 'Test', lastName: 'User', email: 'test@example.com',
      phone: '+1 555 000 0000', country: 'USA', assignedTo: 'Alice K.',
    };
    const state = crmReducer(initial, { type: CRM_ADD_CLIENT, payload });
    expect(state.clients.length).toBe(initial.clients.length + 1);
    const added = state.clients.find((c) => c.email === 'test@example.com');
    expect(added).toBeDefined();
    expect(added.firstName).toBe('Test');
    expect(added.stage).toBe('New Lead');
    expect(added.kycStatus).toBe('pending');
    expect(added.balance).toBe(0);
    expect(added.id).toMatch(/^CLT\d+$/);
    expect(state.selectedClientId).toBe(added.id);
    expect(state.activeView).toBe('clients');
  });

  it('handles CRM_UPDATE_CLIENT', () => {
    const state = crmReducer(initial, {
      type: CRM_UPDATE_CLIENT,
      payload: { id: 'CLT001', changes: { stage: 'Inactive', kycStatus: 'rejected' } },
    });
    const client = state.clients.find((c) => c.id === 'CLT001');
    expect(client.stage).toBe('Inactive');
    expect(client.kycStatus).toBe('rejected');
    // other fields unchanged
    expect(client.firstName).toBe('James');
  });

  it('CRM_UPDATE_CLIENT updates lastActivity', () => {
    const before = initial.clients.find((c) => c.id === 'CLT001').lastActivity;
    const state = crmReducer(initial, {
      type: CRM_UPDATE_CLIENT,
      payload: { id: 'CLT001', changes: { stage: 'Active' } },
    });
    const after = state.clients.find((c) => c.id === 'CLT001').lastActivity;
    expect(after).not.toBe(before);
  });

  it('handles CRM_ADD_NOTE', () => {
    const state = crmReducer(initial, {
      type: CRM_ADD_NOTE,
      payload: { clientId: 'CLT001', text: 'Follow-up scheduled.', author: 'Bob T.' },
    });
    const client = state.clients.find((c) => c.id === 'CLT001');
    expect(client.notes[0].text).toBe('Follow-up scheduled.');
    expect(client.notes[0].author).toBe('Bob T.');
    expect(client.notes[0].id).toBeDefined();
    expect(client.notes[0].date).toBeDefined();
  });

  it('CRM_ADD_NOTE prepends new note', () => {
    const stateWith = crmReducer(initial, {
      type: CRM_ADD_NOTE,
      payload: { clientId: 'CLT001', text: 'First note.', author: 'Alice K.' },
    });
    const stateWith2 = crmReducer(stateWith, {
      type: CRM_ADD_NOTE,
      payload: { clientId: 'CLT001', text: 'Second note.', author: 'Alice K.' },
    });
    const notes = stateWith2.clients.find((c) => c.id === 'CLT001').notes;
    expect(notes[0].text).toBe('Second note.');
  });

  it('handles CRM_ADD_TRANSACTION (Deposit)', () => {
    const state = crmReducer(initial, {
      type: CRM_ADD_TRANSACTION,
      payload: { clientId: 'CLT007', txType: 'Deposit', amount: 5000 },
    });
    const client = state.clients.find((c) => c.id === 'CLT007');
    expect(client.transactions[0].type).toBe('Deposit');
    expect(client.transactions[0].amount).toBe(5000);
    expect(client.transactions[0].status).toBe('completed');
    expect(client.totalDeposits).toBe(5000);
    expect(client.totalWithdrawals).toBe(0);
    expect(client.balance).toBe(5000);
  });

  it('handles CRM_ADD_TRANSACTION (Withdrawal)', () => {
    const state = crmReducer(initial, {
      type: CRM_ADD_TRANSACTION,
      payload: { clientId: 'CLT001', txType: 'Withdrawal', amount: 2000 },
    });
    const client = state.clients.find((c) => c.id === 'CLT001');
    expect(client.transactions[0].type).toBe('Withdrawal');
    expect(client.transactions[0].amount).toBe(2000);
    expect(client.totalWithdrawals).toBe(8500); // 6500 + 2000
    expect(client.balance).toBe(client.totalDeposits - client.totalWithdrawals);
  });

  it('does not mutate state on unknown action', () => {
    const state = crmReducer(initial, { type: '@@UNKNOWN' });
    expect(state).toBe(initial);
  });

  it('handles CRM_SET_REP_FILTER', () => {
    const state = crmReducer(initial, { type: CRM_SET_REP_FILTER, payload: 'Alice K.' });
    expect(state.repFilter).toBe('Alice K.');
  });

  it('handles CRM_DELETE_CLIENT', () => {
    const state = crmReducer(initial, { type: CRM_DELETE_CLIENT, payload: 'CLT001' });
    expect(state.clients.find((c) => c.id === 'CLT001')).toBeUndefined();
    expect(state.clients.length).toBe(initial.clients.length - 1);
  });

  it('CRM_DELETE_CLIENT clears selectedClientId when deleting selected client', () => {
    const withSelected = { ...initial, selectedClientId: 'CLT001' };
    const state = crmReducer(withSelected, { type: CRM_DELETE_CLIENT, payload: 'CLT001' });
    expect(state.selectedClientId).toBeNull();
  });

  it('CRM_DELETE_CLIENT preserves selectedClientId when deleting a different client', () => {
    const withSelected = { ...initial, selectedClientId: 'CLT002' };
    const state = crmReducer(withSelected, { type: CRM_DELETE_CLIENT, payload: 'CLT001' });
    expect(state.selectedClientId).toBe('CLT002');
  });

  it('seed data contains expected client ids', () => {
    const ids = initial.clients.map((c) => c.id);
    expect(ids).toContain('CLT001');
    expect(ids).toContain('CLT010');
  });

  it('seed data has Active clients with non-zero balance', () => {
    const active = initial.clients.filter((c) => c.stage === 'Active');
    expect(active.length).toBeGreaterThan(0);
    active.forEach((c) => expect(c.totalDeposits).toBeGreaterThan(0));
  });
});
