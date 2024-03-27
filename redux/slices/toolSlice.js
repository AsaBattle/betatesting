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
    cursor: '/pen-cursor(w)2.png',        // use the pen cursor as the default
    tolerance: 50,                        // the color tolerance for the magic wand tool
    wandSelector: 'fsam',                 // Either the ai-wand 'fsam' or the regular magic wand 'regular'
    viewMaskActive: false,                // Whether the view mask button is active so the user is viewing the mask
    toolbarVisibility: true,              // Whether the toolbar is visible
    predictionModelName:  'DreamShaper',  // The name of the prediction model used wthen the user hits the generate button
    userIsLoggedInWithAccount:  false,    // Whether the user is logged in with an account(So if false, the user has no membership or account of any kind)
  },
  reducers: {
    setUserIsLoggedInWithAccount: (state, action) => {
      state.userIsLoggedInWithAccount = action.payload;
    },
    setToolbarVisibility: (state, action) => {
      state.toolbarVisibility = action.payload;
      if (action.payload)
        console.log('Toolbar is visible');
      else
        console.log('Toolbar is hidden');
    },
    setPredictionModelName: (state, action) => {
      state.modelName = action.payload;
    },
    setTheViewMaskActive: (state, action) => {
      console.log('dispatch called for setViewMaskActive: ', action.payload);
      state.viewMaskActive = action.payload;
    },
    setWandSelector: (state, action) => {
      state.wandSelector = action.payload;
    },
    setTolerance: (state, action) => {
      state.tolerance = action.payload;
    },
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
                alterZoomWidth, setHamburgerVisible, setCursor, setTolerance,
                setWandSelector, setTheViewMaskActive, setPredictionModelName,
                setToolbarVisibility, setUserIsLoggedInWithAccount } = toolbarSlice.actions;
export default toolbarSlice.reducer;