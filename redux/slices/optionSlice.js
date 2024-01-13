// redux/slices/optionSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const optionSlice = createSlice({
  name: 'option',
  initialState: {
    currentOption: null,
  },
  reducers: {
    setOption: (state, action) => {
      state.currentOption = action.payload;
    },
  },
});

export const { setOption } = optionSlice.actions;
export default optionSlice.reducer;
