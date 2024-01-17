import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBrushSize } from '../../redux/slices/toolSlice';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'; // Make sure to import default styles
import { Plus, Minus } from 'lucide-react';
import { tools } from '../tools/Tools'; // Adjust the import path as necessary


const ToolbarOptions = () => {
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const brushSize = useSelector((state) => state.toolbar.brushSize);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  const currentTool = tools.find(tool => tool.name === currentToolName);
  const dispatch = useDispatch();

  const handleSliderChange = (value) => {
    dispatch(setBrushSize(value));
  };

  const incrementZoom = () => setZoomLevel(zoomLevel + 10);
  const decrementZoom = () => setZoomLevel(zoomLevel - 10);

  switch (currentTool?.name) {
    case 'MaskPainter':
      return (
        <div className="brush-slider-container text-white flex items-center justify-center mx-auto" style={{ width: '30%' }}>
          <label htmlFor="brushSize" className="flex-shrink-0 mr-2">Brush Size: {brushSize}</label>
          <Slider
            min={1}
            max={100}
            value={brushSize}
            onChange={handleSliderChange}
            railStyle={{ backgroundColor: '#eaeaea', height: 8 }}
            trackStyle={{ backgroundColor: '#007bff', height: 8 }}
            handleStyle={{
              borderColor: '#007bff',
              height: 20,
              width: 20,
              marginLeft: 10,
              marginTop: -6,
              backgroundColor: '#007bff',
            }}
          />
        </div>
      );

    case 'Zoom':
      return (  
        <div className="options-container text-black flex items-center justify-center mx-auto">
          <button onClick={decrementZoom} className="zoom-button">
          <Minus />
        </button>
        <input
          type="number"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(Number(e.target.value))}
        className="zoom-input"
        />
        <button onClick={incrementZoom} className="zoom-button">
        <Plus />
        </button>
        </div>
      );
    
    // Add cases for other tools as needed
    default:
      return null;
  }
};

export default ToolbarOptions;

