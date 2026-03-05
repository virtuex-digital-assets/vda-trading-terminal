import { SET_CONNECTION_STATUS } from '../actions/actionTypes';

const initialState = {
  status: 'disconnected', // 'connecting' | 'connected' | 'disconnected' | 'error'
  broker: '',
  pingMs: null,
};

const connectionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONNECTION_STATUS:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

export default connectionReducer;
