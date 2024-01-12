import { createSlice } from '@reduxjs/toolkit';
import { tools } from '../../components/tools/Tools';

export const toolbarSlice = createSlice({
  name: 'toolbar',
  initialState: {
    currentTool: tools[0], 
    brushSize: 40,
    // ... other toolbar state
  },
  reducers: {
    setCurrentTool: (state, action) => {
      state.currentTool = action.payload;
    },
    setBrushSize: (state, action) => {
      state.brushSize = action.payload;
    },
    // ... other reducers for toolbar actions
  },
});

export const { setCurrentTool, setBrushSize } = toolbarSlice.actions;
export default toolbarSlice.reducer;