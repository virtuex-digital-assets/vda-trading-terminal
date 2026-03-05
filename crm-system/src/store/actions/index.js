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
