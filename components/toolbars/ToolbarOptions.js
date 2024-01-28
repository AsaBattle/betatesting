import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBrushSize, setAspectRatio } from '../../redux/slices/toolSlice';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Plus, Minus, Square, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import Button from '@mui/material/Button'; 
import Typography from '@mui/material/Typography';
import { tools } from '../tools/Tools';
import styles from './ToolbarOptions.module.css'; // Make sure this path is correct

const ToolbarOptions = () => {
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const brushSize = useSelector((state) => state.toolbar.brushSize);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  const currentTool = tools.find(tool => tool.name === currentToolName);
  const dispatch = useDispatch();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('');

  const handleAspectRatioClick = (aspectRatio) => {
    setSelectedAspectRatio(aspectRatio);
      dispatch(setAspectRatio(aspectRatio)); 
  };

  useEffect(() => {
    console.log('Current Tool:', currentTool);
  }, [currentTool]);

  const handleSliderChange = (value) => {
    dispatch(setBrushSize(value));
  };


  const incrementZoom = () => setZoomLevel(zoomLevel + 10);
  const decrementZoom = () => setZoomLevel(zoomLevel - 10);

  return (
    <div className={styles.toolbarContainer}>
     {currentTool?.name === 'MaskPainter' && (
      <div className={styles.sliderContainer + " te   xt-white flex justify-center mx-auto"} style={{ width: '100%', padding: '0 20px' }}>
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

      {/**********************************************************************/}
      
      {currentTool?.name === 'Zoom' && (
        <div className="styles.zoomContainer text-black flex items-center justify-center mx-auto">
          <button onClick={decrementZoom} className="zoom-button">
            <Minus />
          </button>
          <input
            type="number"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}x
            className="zoom-input"
          />
          <button onClick={incrementZoom} className="zoom-button">
            <Plus />
          </button>
        </div>
      )}

      {/**********************************************************************/}

   {currentTool?.name === 'AspectRatio' && (
    <div
      className={styles.aspectRatioContainer + ' text-white flex flex-wrap justify-center mx-auto'}
      style={{ width: '100%', padding: '0 20px' }}
    >
      <div className="flex flex-col items-center">
        <Button
          variant="contained"
          onClick={() => handleAspectRatioClick('square')}
          startIcon={<Square />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === 'square' ? styles.selectedButton : ''}`}
        >
          <Typography>Square</Typography>
        </Button>
      </div>

      <div className="flex flex-col items-center" style={{ marginLeft: '20px', marginRight: '20px' }}>
        <Button
          variant="contained"
          onClick={() => handleAspectRatioClick('wide')}
          startIcon={<RectangleHorizontal />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === 'wide' ? styles.selectedButton : ''}`}
        >
          <Typography>Wide</Typography>
        </Button>

        <Button
          variant="contained"
          onClick={() => handleAspectRatioClick('tall')}
          startIcon={<RectangleVertical />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === 'tall' ? styles.selectedButton : ''}`}
        >
          <Typography>Tall</Typography>
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <Button
          variant="contained"
          onClick={() => handleAspectRatioClick('43')}
          startIcon={<RectangleHorizontal style={{ transform: 'scale(1.5)' }} />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === '43' ? styles.selectedButton : ''}`}
        >
          <Typography>4:3</Typography>
        </Button>

        <Button
          variant="contained"
          onClick={() => handleAspectRatioClick('34')}
          startIcon={<RectangleVertical style={{ transform: 'scale(1.5)' }} />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === '34' ? styles.selectedButton : ''}`}
        >
          <Typography>3:4</Typography>
        </Button>
      </div>
    </div>
  )}


  </div>
  )
};

export default ToolbarOptions;
