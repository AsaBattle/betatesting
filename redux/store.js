// store.js
import { configureStore } from '@reduxjs/toolkit';
import toolbarReducer from './slices/toolSlice';

export const store = configureStore({
  reducer: {
    toolbar: toolbarReducer,
    // ... other slice reducers
  },
});
