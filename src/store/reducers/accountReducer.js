import { UPDATE_ACCOUNT, SET_LEVERAGE } from '../actions/actionTypes';

const initialState = {
  login: '12345678',
  name: 'VDA Demo Account',
  server: 'VDABroker-Demo',
  currency: 'USD',
  balance: 10000.0,
  equity: 10000.0,
  margin: 0.0,
  freeMargin: 10000.0,
  marginLevel: 0,
  leverage: 100,
  profit: 0.0,
};

const accountReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ACCOUNT:
      return { ...state, ...action.payload };

    case SET_LEVERAGE:
      return { ...state, leverage: action.payload };

    default:
      return state;
  }
};

export default accountReducer;
