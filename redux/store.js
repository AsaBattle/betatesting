// store.js
import { configureStore } from '@reduxjs/toolkit';
import toolbarReducer from './slices/toolSlice';
import optionReducer from './slices/optionSlice'; 

export const store = configureStore({
  reducer: {
    toolbar: toolbarReducer,
    option: optionReducer,
    // ... other slice reducers
  },
});
