import { createSlice } from '@reduxjs/toolkit';
import { tools } from '../../components/tools/Tools';

export const toolbarSlice = createSlice({
  name: 'toolbar',
  initialState: {
    currentToolName: tools[0].name, 
    brushSize: 40,
    aspectRatioName: 'wide',
    // ... other toolbar state
  },
  reducers: {
    setCurrentTool: (state, action) => {
      state.currentToolName = action.payload;
    },
    setBrushSize: (state, action) => {
      state.brushSize = action.payload;
    },
    setAspectRatio: (state, action) => {
      state.aspectRatioName = action.payload;
    },
    // ... other reducers for toolbar actions
  },
});

export const { setCurrentTool, setBrushSize } = toolbarSlice.actions;
export default toolbarSlice.reducer;