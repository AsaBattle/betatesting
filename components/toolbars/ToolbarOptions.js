import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBrushSize } from '../../redux/slices/toolSlice';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Plus, Minus } from 'lucide-react';
import { tools } from '../tools/Tools';
import styles from './ToolbarOptions.module.css'; // Make sure this path is correct

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

  return (
    <div className={styles.toolbarContainer}>
     {currentTool?.name === 'MaskPainter' && (
  <div className={styles.sliderContainer + " text-white flex justify-center mx-auto"} style={{ width: '100%', padding: '0 20px' }}>
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
      {/* Column for the slider */}
      <div style={{ flexBasis: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <label htmlFor="brushSize" className="flex-shrink-0 mb-2" style={{ alignSelf: 'center' }}>Brush Size</label>
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
            marginTop: -6,
            backgroundColor: '#007bff',
          }}
        />
      </div>
      {/* Column for the brush size indicator */}
      <div style={{ flexBasis: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: `${brushSize}px`,
            height: `${brushSize}px`,
            borderRadius: '50%', // Makes the div a circle
            backgroundColor: 'white',
            // Make sure the circle doesn't exceed the container
            maxWidth: '100%',
            maxHeight: '100%',
            flexShrink: 0, // Prevent the circle from shrinking
          }}
        />
      </div>
    </div>
  </div>
)}


      {currentTool?.name === 'Zoom' && (
        <div className="styles.zoomContainer text-black flex items-center justify-center mx-auto">
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
      )}

      {/* Add cases for other tools as needed. For example: */}
      {/* {currentTool?.name === 'OtherTool' && (
        <div className="other-tool-options">
          // Options for OtherTool
        </div>
      )} */}
    </div>
  );
};

export default ToolbarOptions;
