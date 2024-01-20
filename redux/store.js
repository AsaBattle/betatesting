// store.js
import { configureStore } from '@reduxjs/toolkit';
import toolbarReducer from './slices/toolSlice';
import optionReducer from './slices/optionSlice'; 
import historyReducer from './slices/historySlice'; // Adjust the path as necessary
export const store = configureStore({
  reducer: {
    toolbar: toolbarReducer,
    option: optionReducer,
    history: historyReducer,
    // ... other slice reducers
  },
});
