import { combineReducers } from 'redux';
import crmReducer from './reducers/crmReducer';
import brokerReducer from './reducers/brokerReducer';

const rootReducer = combineReducers({
  crm: crmReducer,
  broker: brokerReducer,
});

export default rootReducer;
