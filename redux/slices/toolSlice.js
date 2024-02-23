import { createSlice } from '@reduxjs/toolkit';
import { tools } from '../../components/tools/Tools';

export const toolbarSlice = createSlice({
  name: 'toolbar',
  initialState: {
    currentToolName: tools[0].name, 
    brushSize: 40,
    aspectRatioName: '1:1',
    zoomWidth: 512,
    hamburgerVisible: false,
    cursor: '/pen-cursor(w)2.png', // use the pen cursor as the default
  },
  reducers: {
    setCursor: (state, action) => {
      state.cursor = action.payload;
    },
    setHamburgerVisible: (state, action) => {
      state.hamburgerVisible = action.payload;
    },
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
  },
});

export const { setCurrentTool, setBrushSize, setAspectRatio, setZoomWidth, 
                alterZoomWidth, setHamburgerVisible, setCursor } = toolbarSlice.actions;
export default toolbarSlice.reducer;