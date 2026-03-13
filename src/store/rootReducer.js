import { combineReducers } from 'redux';
import marketReducer from './reducers/marketReducer';
import ordersReducer from './reducers/ordersReducer';
import accountReducer from './reducers/accountReducer';
import connectionReducer from './reducers/connectionReducer';
import terminalReducer from './reducers/terminalReducer';
import crmReducer from './reducers/crmReducer';

const rootReducer = combineReducers({
  market: marketReducer,
  orders: ordersReducer,
  account: accountReducer,
  connection: connectionReducer,
  terminal: terminalReducer,
  crm: crmReducer,
});

export default rootReducer;
