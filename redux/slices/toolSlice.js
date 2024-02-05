import { createSlice } from '@reduxjs/toolkit';
import { tools } from '../../components/tools/Tools';

export const toolbarSlice = createSlice({
  name: 'toolbar',
  initialState: {
    currentToolName: tools[0].name, 
    brushSize: 40,
    aspectRatioName: 'Square',
    zoomWidth: 512,
  },
  reducers: {
    setZoomWidth: (state, action) => {
      state.zoomWidth = action.payload;
    },
    alterZoomWidth: (state, action) => {
      state.zoomWidth += action.payload;
    },
    setCurrentTool: (state, action) => {
      state.currentToolName = action.payload;
    },
    setBrushSize: (state, action) => {
      state.brushSize = action.payload;
    },
    setAspectRatio: (state, action) => {
      console.log('dispatch called for setAspectRatio: ', action.payload);
      state.aspectRatioName = action.payload;
    },
    // ... other reducers for toolbar actions
  },
});

export const { setCurrentTool, setBrushSize, setAspectRatio, setZoomWidth, alterZoomWidth } = toolbarSlice.actions;
export default toolbarSlice.reducer;