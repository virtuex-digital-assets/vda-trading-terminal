import { createStore, combineReducers } from 'redux';
import conversationsReducer from './conversationsReducer';

const rootReducer = combineReducers({
  conversations: conversationsReducer,
});

const store = createStore(rootReducer);

export default store;
