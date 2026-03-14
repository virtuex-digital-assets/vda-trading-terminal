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
  CRM_IMPORT_CLIENTS,
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
} from './actionTypes';

export const crmSetView = (view) => ({ type: CRM_SET_VIEW, payload: view });
export const crmSelectClient = (id) => ({ type: CRM_SELECT_CLIENT, payload: id });
export const crmAddClient = (data) => ({ type: CRM_ADD_CLIENT, payload: data });
export const crmUpdateClient = (id, changes) => ({ type: CRM_UPDATE_CLIENT, payload: { id, changes } });
export const crmSetSearch = (query) => ({ type: CRM_SET_SEARCH, payload: query });
export const crmSetStageFilter = (stage) => ({ type: CRM_SET_STAGE_FILTER, payload: stage });
export const crmAddNote = (clientId, text, author) => ({ type: CRM_ADD_NOTE, payload: { clientId, text, author } });
export const crmAddTransaction = (clientId, txType, amount) => ({ type: CRM_ADD_TRANSACTION, payload: { clientId, txType, amount } });
export const crmDeleteClient = (id) => ({ type: CRM_DELETE_CLIENT, payload: id });
export const crmSetRepFilter = (rep) => ({ type: CRM_SET_REP_FILTER, payload: rep });
export const crmImportClients = (clients) => ({ type: CRM_IMPORT_CLIENTS, payload: clients });

export const brokerSetView = (view) => ({ type: BROKER_SET_VIEW, payload: view });

// KYC
export const brokerApproveKyc = (docId) => ({ type: BROKER_APPROVE_KYC, payload: docId });
export const brokerRejectKyc = (docId, reason) => ({ type: BROKER_REJECT_KYC, payload: { docId, reason } });
export const brokerRequestKycDocs = (docId, notes) => ({ type: BROKER_REQUEST_KYC_DOCS, payload: { docId, notes } });

// Trading Accounts
export const brokerCreateTradingAccount = (data) => ({ type: BROKER_CREATE_TRADING_ACCOUNT, payload: data });
export const brokerUpdateTradingAccount = (id, changes) => ({ type: BROKER_UPDATE_TRADING_ACCOUNT, payload: { id, changes } });
export const brokerDisableTradingAccount = (id) => ({ type: BROKER_DISABLE_TRADING_ACCOUNT, payload: id });

// Affiliates
export const brokerAddAffiliate = (data) => ({ type: BROKER_ADD_AFFILIATE, payload: data });
export const brokerUpdateAffiliate = (id, changes) => ({ type: BROKER_UPDATE_AFFILIATE, payload: { id, changes } });

// Tickets
export const brokerAddTicket = (data) => ({ type: BROKER_ADD_TICKET, payload: data });
export const brokerUpdateTicket = (id, changes) => ({ type: BROKER_UPDATE_TICKET, payload: { id, changes } });
export const brokerReplyTicket = (id, reply) => ({ type: BROKER_REPLY_TICKET, payload: { id, reply } });
export const brokerCloseTicket = (id) => ({ type: BROKER_CLOSE_TICKET, payload: id });

// Notifications
export const brokerAddNotification = (notif) => ({ type: BROKER_ADD_NOTIFICATION, payload: notif });
export const brokerDismissNotification = (id) => ({ type: BROKER_DISMISS_NOTIFICATION, payload: id });
export const brokerDismissAllNotifications = () => ({ type: BROKER_DISMISS_ALL_NOTIFICATIONS });

// Settings
export const brokerUpdateSettings = (changes) => ({ type: BROKER_UPDATE_SETTINGS, payload: changes });
