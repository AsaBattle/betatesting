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
    sortBy: 'date',
    sortOrder: 'newest',
    columns: 5,
    maxImagesPerPage: 25,
    currentPage: 1,
    imageSavePath: 'BaseFolder',
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
      state.index = action.payload;
    },
    pushToUndo: (state, action) => {
      console.log('pushToUndo is executing');
      state.undoStack.push(action.payload);
    },
    setCurrentImage: (state, action) => {
      if (state.currentImage) {
        state.undoStack.push(state.currentImage);
        state.redoStack = [];
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
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setColumns: (state, action) => {
      state.columns = action.payload;
    },
    setMaxImagesPerPage: (state, action) => {
      state.maxImagesPerPage = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setImageSavePath: (state, action) => {
      state.imageSavePath = action.payload;
    },
  },
});

export const {
  incIndex,
  decIndex,
  setIndex,
  pushToUndo,
  setCurrentImage,
  undo,
  redo,
  setUserId,
  setViewModeLoadedImages,
  setSortBy,
  setSortOrder,
  setColumns,
  setMaxImagesPerPage,
  setCurrentPage,
  setImageSavePath,
} = historySlice.actions;

export default historySlice.reducer;