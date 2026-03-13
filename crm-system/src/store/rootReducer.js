import { combineReducers } from 'redux';
import crmReducer from './reducers/crmReducer';

const rootReducer = combineReducers({
  crm: crmReducer,
});

export default rootReducer;
