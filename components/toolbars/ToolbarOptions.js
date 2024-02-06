import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBrushSize, setAspectRatio, setZoomWidth, alterZoomWidth } from '../../redux/slices/toolSlice';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Plus, Minus, Square, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import Button from '@mui/material/Button'; 
import Typography from '@mui/material/Typography';
import { tools } from '../tools/Tools';
import styles from './ToolbarOptions.module.css'; // Make sure this path is correct
import Tooltip from '../tooltip';


function ToolbarOptions (props)  {
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const brushSize = useSelector((state) => state.toolbar.brushSize);
  const zoomLevel = useSelector((state) => state.toolbar.zoomWidth);
  const canvasRef = props.canvasRef;

  const currentTool = tools.find(tool => tool.name === currentToolName);
  const dispatch = useDispatch();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('');

  // Assuming index is still derived from Redux or props as before
  const index = useSelector((state) => (state.history.index-1));

  // This line and related calculations for currentPredictionImage remain as you requested
  const currentPredictionImage = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].output && props.predictions[index].output.length > 0
      ? props.predictions[index].output[props.predictions[index].output.length - 1]
      : null
    : null;


  // Calculate aspect ratio from the current prediction if available
  const currentImageAspectRatio = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].aspectRatioName
    : 'Not Yet Set'; // Default or fallback aspect ratio


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

  const incrementZoom = () => dispatch(alterZoomWidth(10));
  const decrementZoom = () => dispatch(alterZoomWidth(-10));

  return (
     <div className={styles.toolbarContainer} style={{ position: 'relative' }}>
  {currentTool?.name === 'MaskPainter' && (
  <div className={styles.sliderContainer + " text-white justify-center mx-auto"}
  style={{ 
    width: '100%', 
    padding: '0 20px', 
    marginTop: '-8px', // Move everything up by 15px
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', 
    gridTemplateRows: '50px 50px', // Set a fixed height for both rows
    gridTemplateAreas: `
      "undo redo"
      "slider circle"
    `, 
    gap: '1px',
    alignItems: 'start' // Align items to the start of the container
  }}>
    {/* Undo button (row 1, col 1) */}
    <Tooltip text="Undo the last brush stroke change">
    <button
      onClick={() => canvasRef.current.UndoLastMaskLine()}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
      style={{
        gridArea: 'undo',
        justifySelf: 'start', // Align to the start of the grid area
        alignSelf: 'end', // Move down within the grid area
        padding: '5px 10px', // Reduced padding
        fontSize: '0.75rem', // Smaller font size
        width: 'fit-content' // Make width fit the content
      }}
    >
      Undo
    </button>
    </Tooltip>

    {/* Redo button (row 1, col 2) */}
    <Tooltip text="Redo the last brush stroke change">
    <button
      onClick={() => canvasRef.current.RedoLastMaskLine()}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
      style={{
        gridArea: 'redo',
        justifySelf: 'end', // Align to the end of the grid area
        alignSelf: 'end', // Move down within the grid area
        padding: '5px 10px', // Reduced padding
        fontSize: '0.75rem', // Smaller font size
        width: 'fit-content' // Make width fit the content
      }}
    >
      Redo
    </button>
    </Tooltip>

    {/* Slider (row 2, col 1) */}
    <div style={{
      gridArea: 'slider',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start' // Move up within the grid area
    }}>
      <Tooltip text="changes the size of the masking brush's stroke">
      <label htmlFor="brushSize" className="flex-shrink-0 mb-2">Brush Size</label>
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
      </Tooltip>
    </div>

    {/* Brush size indicator (row 2, col 2) */}
    <Tooltip text="the size of the masking brush's stroke">
    <div style={{ 
      gridArea: 'circle', 
      position: 'relative', // Set the position to relative
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center'
    }}>
      <div
        style={{
          position: 'absolute', // Position absolutely to center it based on transform
          top: '50%', // Set top to 50%
          left: '50%', // Set left to 50%
          transform: 'translate(-50%, -50%)', // Use transform to center the circle
          width: `${brushSize}px`,
          height: `${brushSize}px`,
          borderRadius: '50%', // Makes the div a circle
          backgroundColor: 'white',
        }}
      />
    </div>
    </Tooltip>
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
            onChange={(e) => dispatch(setZoomWidth(e.target.value))}
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
          onClick={() => handleAspectRatioClick('Square')}
          startIcon={<Square />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === 'Square' ? styles.selectedButton : ''}`}
        >
          <Typography>Square</Typography>
        </Button>

        <Typography className="text-center mt-2">Current: {currentImageAspectRatio} </Typography>

      </div>

      <div className="flex flex-col items-center" style={{ marginLeft: '20px', marginRight: '20px' }}>
        <Button
          variant="contained"
          onClick={() => handleAspectRatioClick('Wide')}
          startIcon={<RectangleHorizontal />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === 'Wide' ? styles.selectedButton : ''}`}
        >
          <Typography>Wide</Typography>
        </Button>

        <Button
          variant="contained"
          onClick={() => handleAspectRatioClick('Tall')}
          startIcon={<RectangleVertical />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === 'Tall' ? styles.selectedButton : ''}`}
        >
          <Typography>Tall</Typography>
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <Button
          variant="contained"
          onClick={() => handleAspectRatioClick('4:3')}
          startIcon={<RectangleHorizontal style={{ transform: 'scale(1.5)' }} />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === '4:3' ? styles.selectedButton : ''}`}
        >
          <Typography>4:3</Typography>
        </Button>

        <Button
          variant="contained"
          onClick={() => handleAspectRatioClick('3:4')}
          startIcon={<RectangleVertical style={{ transform: 'scale(1.5)' }} />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === '3:4' ? styles.selectedButton : ''}`}
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
