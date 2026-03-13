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
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './rootReducer';

const composeEnhancers =
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware()));

export default store;
