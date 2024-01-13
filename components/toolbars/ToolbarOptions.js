import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBrushSize } from '../../redux/slices/toolSlice'; // Adjust the import path as necessary

const ToolbarOptions = () => {
  // Use useSelector to get the current state from the store
  const currentTool = useSelector((state) => state.toolbar.currentTool);
  const brushSize = useSelector((state) => state.toolbar.brushSize);
  const [zoomLevel, setZoomLevel] = useState(100); // Default zoom level

  // Use useDispatch to create dispatch function
  const dispatch = useDispatch();

  // Handle change function for brush size
  const handleBrushSizeChange = (e) => {
    dispatch(setBrushSize(Number(e.target.value)));
  };

  // Functions to handle zoom level changes
  const incrementZoom = () => setZoomLevel(zoomLevel + 10);
  const decrementZoom = () => setZoomLevel(zoomLevel - 10);

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

      case 'Zoom':
        return (  
          <div className="options-container text-black flex items-center justify-center mx-auto"> {/* Ensure this matches your CSS class */}
            <button onClick={decrementZoom}>-</button>
            <input
              type="number"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="zoom-input"
            />
            <button onClick={incrementZoom}>+</button>
          </div>
        );
    
    // Add cases for other tools as needed
    default:
      return null;
  }
};

export default ToolbarOptions;

