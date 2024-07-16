import { createSlice } from '@reduxjs/toolkit';
import { set } from 'lodash';

export const historySlice = createSlice({
  name: 'history',
  initialState: {
    undoStack: [],
    redoStack: [],
    index: 0,
    userId: null,
    currentImage: null,
    viewModeLoadedImages: {
      imageUrl: null,
      aspectRatioName: null,
    },
  },
  reducers: {
    setViewModeLoadedImages: (state, action) => {
      const { imageUrl, aspectRatioName } = action.payload;
      console.log('setViewModeLoadedImages is executing');
      state.viewModeLoadedImages = { imageUrl, aspectRatioName };
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    incIndex: (state) => {
      console.log('incIndex is executing');
      state.index += 1;
    },
    decIndex: (state) => {
      console.log('decIndex is executing');
      state.index -= 1;
      if (state.index < 0) {
        state.index = 0;
      }
    },
    setIndex: (state, action) => {
      //console.log('setIndex is executing and setting to: ' + action.payload);
      state.index = action.payload;
    },
    pushToUndo: (state, action) => {
      console.log('pushToUndo is executing');
      state.undoStack.push(action.payload); // Push the current image to the undo stack
    },
    setCurrentImage: (state, action) => {
      if (state.currentImage) {
        state.undoStack.push(state.currentImage);
        state.redoStack = []; // Clear redo stack on new action
      }
      state.currentImage = action.payload;
    },
    undo: (state) => {
      const lastImage = state.undoStack.pop();
      if (lastImage) {
        state.redoStack.push(state.currentImage);
        state.currentImage = lastImage;
      }
    },
    redo: (state) => {
      const nextImage = state.redoStack.pop();
      if (nextImage) {
        state.undoStack.push(state.currentImage);
        state.currentImage = nextImage;
      }
    },
    // Optionally, add more reducers for clearing history, etc.
  },
});

export const { incIndex, decIndex, setIndex, pushToUndo, setCurrentImage, 
                undo, redo, setUserId, setViewModeLoadedImages } = historySlice.actions;
export default historySlice.reducer;
