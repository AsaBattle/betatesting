import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBrushSize } from '../../redux/slices/toolSlice'; // Adjust the import path as necessary

const ToolbarOptions = () => {
  // Use useSelector to get the current state from the store
  const currentTool = useSelector((state) => state.toolbar.currentTool);
  const brushSize = useSelector((state) => state.toolbar.brushSize);

  // Use useDispatch to create dispatch function
  const dispatch = useDispatch();

  // Handle change function for brush size
  const handleBrushSizeChange = (e) => {
    dispatch(setBrushSize(Number(e.target.value)));
  };

  // Render options based on the current tool
  switch (currentTool.name) {
    case 'MaskPainter':
      return (
        <div className="brush-slider-container text-white flex items-center justify-center mx-auto" style={{ width: '30%' }}>
          <label htmlFor="brushSize" className="flex-shrink-0 mr-2">Brush Size: {brushSize}</label>
          <input
            type="range"
            id="brushSize"
            name="brushSize"
            min="1"
            max="100"
            value={brushSize}
            onChange={handleBrushSizeChange}
            className="brush-slider flex-grow"
          />
        </div>
      );
    // Add cases for other tools as needed
    default:
      return null;
  }
};

export default ToolbarOptions;


/* the old toolbaroptions.js before redux
import React from 'react';
import {tools} from './Tools';

const ToolbarOptions = ({ currentTool, brushSize, setBrushSize }) => {

  console.log("currentTool: " + currentTool);
  switch(currentTool.name) {
    case 'MaskPainter':
      return <MaskPaintingOptions brushSize={brushSize} setBrushSize={setBrushSize} />;
    // Add cases for other tools
    default:
      return null;
  }
};


const MaskPaintingOptions = ({ brushSize, setBrushSize }) => {
  return (
    <div className="brush-slider-container text-white flex items-center justify-center mx-auto" style={{ width: '30%' }}>
      <label htmlFor="brushSize" className="flex-shrink-0 mr-2">Brush Size: {brushSize}</label>
      <input
        type="range"
        id="brushSize"
        name="brushSize"
        min="1"
        max="100"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        className="brush-slider flex-grow"
      />
    </div>
  );
};
export default ToolbarOptions;)*/