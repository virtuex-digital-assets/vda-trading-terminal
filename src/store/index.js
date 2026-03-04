import { createStore, combineReducers } from 'redux';
import walletReducer from './reducers/walletReducer';
import ordersReducer from './reducers/ordersReducer';
import marketReducer from './reducers/marketReducer';

const rootReducer = combineReducers({
  wallet: walletReducer,
  orders: ordersReducer,
  market: marketReducer,
});

const store = createStore(rootReducer);

export default store;
