import { ADD_LOG, CLEAR_LOG } from '../actions/actionTypes';

const MAX_LOG_ENTRIES = 500;

const initialState = {
  entries: [],
};

const terminalReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_LOG: {
      const entries = [action.payload, ...state.entries].slice(0, MAX_LOG_ENTRIES);
      return { ...state, entries };
    }

    case CLEAR_LOG:
      return { ...state, entries: [] };

    default:
      return state;
  }
};

export default terminalReducer;
