import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBrushSize, setAspectRatio, setZoomWidth, alterZoomWidth, setTolerance, setWandSelector, setTheViewMaskActive } from '../../redux/slices/toolSlice';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Wand2, Plus, Minus, Square, RectangleHorizontal, RectangleVertical, Undo, Redo, Eraser } from 'lucide-react';
import Button from '@mui/material/Button'; 
import Typography from '@mui/material/Typography';
import { tools } from '../tools/Tools';
import { FSAMProcessor } from '../Utils/Utilities';
import styles from './ToolbarOptions.module.css'; // Make sure this path is correct
import Tooltip from '../tooltip';


// This function is a custom hook that returns the window width
function useWindowWidth() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    function checkSize() {
      setIsSmallScreen(window.innerWidth < 768);
    }
    checkSize(); // Check immediately on mount
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return isSmallScreen;
}

function ToolbarOptions (props)  {
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const brushSize = useSelector((state) => state.toolbar.brushSize);
  const zoomLevel = useSelector((state) => state.toolbar.zoomWidth);
  const magicWandTolerance = useSelector((state) => state.toolbar.tolerance);
  const magicWandSelector = useSelector((state) => state.toolbar.wandSelector);
  const canvasRef = props.canvasRef;

  const currentTool = tools.find(tool => tool.name === currentToolName);
  const dispatch = useDispatch();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('');
  const hamburgerVisible = useWindowWidth(); // If the screens width is less than 768px, set hamburgerVisible to true(Which means the menu/hamburger icon is visible)

  // Assuming index is still derived from Redux or props as before
  const index = useSelector((state) => (state.history.index-1));

  const currentPrediction = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index]
    : null;

  // This line and related calculations for currentPredictionImage remain as you requested
  const currentPredictionImage = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].output && props.predictions[index].output.length > 0
      ? props.predictions[index].output[props.predictions[index].output.length - 1]
      : null
    : null;

    
  // Get the current state
  const aspectRatioName = useSelector((state) => state.toolbar.aspectRatioName);

  // Calculate aspect ratio from the current prediction if available
  let currentImageAspectRatio = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].aspectRatioName
    : aspectRatioName; // Default or fallback aspect ratio

  // Initialize a local state variable
  const [viewMaskRadioButton, setViewMaskRadioButton] = useState(false);

  // If the current prediction has a mask, set the viewMaskActive to true
  let currentPredictionImageMask = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].magicWandMask && props.predictions[index].magicWandMask.length > 0
      ? props.predictions[index].magicWandMask
      : null
    : null;

  const [viewMaskActive, setViewMaskActive] = useState(currentPredictionImageMask !== null);
  
  const [currentPredictionFSAMGenerationCounter, setCurrentPredictionFSAMGenerationCounter] = useState('----');

  const currentPredictionAvailable = props.predictions && props.predictions[index] !== null && props.predictions.length > 0;


  // This function is called when the aspect ratio button is clicked
  const handleGenAIMask = async () => {
    console.log("handleGenAIMask props.predictions: ", props.predictions);

    // If the current prediction is null, return as we can't generate a mask with no image
    if (props.predictions[index] === null ||
      props.predictions.length <= 0)
      return;

    console.log("right before await FSAMProcessor...");
    // Start the process of generating the AI mask via the fast segmentation model
  await FSAMProcessor(props.predictions[index], props.setPredictions);
    console.log("...right after await FSAMProcessor");

    // flip flops the viewmaskactive state
    //setViewMaskActive(!viewMaskActive);
  // Update the currentPredictionFSAMGenerationCounter state after FSAMProcessor completes
  const updatedCounter = props.predictions[index].fsamGenerationCounter;
  setCurrentPredictionFSAMGenerationCounter(updatedCounter);
  console.log('@@@Generating AI Mask');
  console.log('@@@predictions: ', props.predictions);
};

useEffect(() => {
  const updatedCounter = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].fsamGenerationCounter
    : '--';

  setCurrentPredictionFSAMGenerationCounter(updatedCounter);
}, [props.predictions, index]);

  // Deactivate the view mask button if there's no mask, or activate if there is
  useEffect(() => {
    console.log('useEffect setting: currentPredictionImageMask: ', currentPredictionImageMask);
    setViewMaskActive(currentPredictionImageMask !== null);
    
    // if there's no mask, the view mask button's state to off
    if (!viewMaskActive || currentPredictionImageMask === null)
      setViewMaskRadioButton(false);
  }, [currentPredictionImageMask]);


  const handleAspectRatioClick = (aspectRatio) => {
    setSelectedAspectRatio(aspectRatio);
      dispatch(setAspectRatio(aspectRatio)); 
  };

  useEffect(() => {
    currentImageAspectRatio = aspectRatioName;
  }, [currentToolName]);


  useEffect(() => {
    console.log('dispatch is being called for setViewMaskRadioButton: ', viewMaskRadioButton);
   dispatch(setTheViewMaskActive(viewMaskRadioButton));
  }, [viewMaskRadioButton]);


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
      marginTop: '1px', 
      marginRight: hamburgerVisible ? '-60px' : '0px', 
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr', 
      gridTemplateRows: '40px 50px', 
      gridTemplateAreas: `
        "undo middle redo"
        "slider slider circle"
      `, 
      gap: '1px',
      alignItems: 'start'
    }}>
      {/* Undo button (row 1, col 1) */}
      <Tooltip text="Undo the last brush stroke change">
      <button
        onClick={() => canvasRef.current.UndoLastMaskLine()}
        className="hover:bg-blue-700 text-white font-bold rounded"
        style={{
          gridArea: 'undo',
          justifySelf: 'start',
          alignSelf: 'end',
          padding: '5px 10px',
          fontSize: '0.75rem',
          width: 'fit-content'
        }}
      >
        <Undo/>
      </button>
      </Tooltip>

      {/* Middle button (row 1, col 2) */}
      <Tooltip text="Clear all strokes">
      <button
      onClick={() => canvasRef.current.ClearMaskLines()}
        className="hover:bg-blue-700 text-white font-bold rounded"
        style={{
          gridArea: 'middle',
          justifySelf: 'center',
          alignSelf: 'end',
          padding: '5px 10px',
          fontSize: '0.75rem',
          width: 'fit-content'
        }}
      >
        <Eraser />
      </button>
      </Tooltip>

      {/* Redo button (row 1, col 3) */}
      <Tooltip text="Redo the last brush stroke change">
      <button
        onClick={() => canvasRef.current.RedoLastMaskLine()}
        className="hover:bg-blue-700 text-white font-bold rounded"
        style={{
          gridArea: 'redo',
          justifySelf: 'end',
          alignSelf: 'end',
          padding: '5px 10px',
          fontSize: '0.75rem',
          width: 'fit-content'
        }}
      >
        <Redo/>
      </button>
      </Tooltip>

      {/* Slider (row 2, col 1-2) */}
      <div style={{
        gridArea: 'slider',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start'
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

      {/* Brush size indicator (row 2, col 3) */}
      <Tooltip text="the size of the masking brush's stroke">
      <div style={{ 
        gridArea: 'circle', 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <div
          style={{
            position: 'absolute', 
            marginTop: '5px', 
            marginLeft: !hamburgerVisible ? '40px' : '0px', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: `${brushSize}px`,
            height: `${brushSize}px`,
            borderRadius: '50%', 
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
      
      {currentTool?.name === 'Wand' && (
        <div className="styles.wandContainer text-black flex items-center justify-center mx-auto">
          <div className="flex">
            <div className="flex flex-col mr-4">
              <button
                onClick={handleGenAIMask}
                className={`${styles.button} ${currentPredictionAvailable ? styles.buttonEnabled : styles.buttonDisabled}`}
                disabled={!currentPredictionAvailable}
              >
                <span>Generate</span>
                <span>AI Coloring</span>
              </button>
              <label className={viewMaskActive ? styles.textEnabled : styles.textDisabled}>
                View Mask :
                <input
                  type="checkbox"
                  checked={viewMaskRadioButton}
                  onChange={(e) => setViewMaskRadioButton(e.target.checked)}
                  disabled={!viewMaskActive}
                />
              </label>
              Creation Time : {currentPredictionFSAMGenerationCounter}
            </div>
            <div>
              <label htmlFor="tolerance">Tolerance:</label>
              <input
                type="number"
                id="tolerance"
                value={magicWandTolerance}
                onChange={(e) => dispatch(setTolerance(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-col ml-4">
            <button className={styles.button}  onClick={() => canvasRef.current.ClearMagicWandResult()}>
              Clear Mask
            </button>
          </div>
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
          style={{ margin: '5px' }}
          variant="contained"
          onClick={() => handleAspectRatioClick('1:1')}
          startIcon={<Square />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === '1:1' ? styles.selectedButton : ''}`}
        >
          <Typography>1:1</Typography>
        </Button>

        <Typography className="text-center mt-2">Current Image: {currentImageAspectRatio} </Typography>

      </div>

      <div className="flex flex-col items-center" style={{ marginLeft: '20px', marginRight: '20px' }}>
        <Button
          style={{ margin: '5px' }}
          variant="contained"
          onClick={() => handleAspectRatioClick('16:9')}
          startIcon={<RectangleHorizontal />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === '16:9' ? styles.selectedButton : ''}`}
        >
          <Typography>16:9</Typography>
        </Button>

        <Button
          style={{ margin: '5px' }}
          variant="contained"
          onClick={() => handleAspectRatioClick('9:16')}
          startIcon={<RectangleVertical />}
          size="large"
          className={`${styles.button} ${selectedAspectRatio === '9:16' ? styles.selectedButton : ''}`}
        >
          <Typography>9:16</Typography>
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <Button
          style={{ margin: '5px' }}
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
          style={{ margin: '5px' }}
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
