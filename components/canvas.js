import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import Image from 'next/image';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Spinner from 'components/spinner';
import { tools, getResolution } from './tools/Tools'; // Adjust the import path as necessary
import Cursor from './cursor';
import { useSelector, useDispatch } from 'react-redux';


const Canvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const [allowDrawing, setAllowDrawing] = useState(true);
  const canvasStateRef = useRef(''); // Initialize with an empty string or appropriate initial state
  const [predictionStatus, setPredictionStatus] = props.currentPredictionStatus;
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const currentTool = tools.find(tool => tool.name === currentToolName);
  const dispatch = useDispatch();

  const [mask, setMask] = useState(null); // Holds the mask used by the magic wand tool
  const [magicWandResultImg, setMagicWandResultImg] = useState(null); // Holds the resulting image of the magic wand tool

  // Assuming index is still derived from Redux or props as before
    const index = useSelector((state) => (state.history.index - 1));
    const currentPredictionImageRef = useRef();

  // This line and related calculations for currentPredictionImage remain as you requested
  const currentPredictionImage = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].output && props.predictions[index].output.length > 0
      ? props.predictions[index].output[props.predictions[index].output.length - 1]
      : null
    : null;

  // Calculate aspect ratio from the current prediction if available
  const currentAspectRatioName = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].aspectRatioName
    : 'default'; // Default or fallback aspect ratio


  const { width, height } = getResolution(currentAspectRatioName);

  const isTall = height > width;
  const canvasContainerStyle = isTall ? {
    height: '80vh',
    maxWidth: '100%',
    width: `min(${(width / height) * 80}vh, 100%)`,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 10,
  } : {
    width: '100%',
    paddingTop: `${(height / width) * 100}%`,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 10,
  };

  useEffect(() => {
    if (!currentTool) {
      console.error('Current tool is not defined.');
      return;
    }

    setAllowDrawing(currentToolName === 'MaskPainter');
  
    const canvasContainer = document.getElementById('canvasContainer');
    if (!canvasContainer) {
      console.error('Canvas container id not found');
      return;
    }
    
    console.log('Canvas.js: Setting cursor to: ', currentTool.cursor);
    canvasContainer.style.cursor = currentTool.cursor;
  }, [currentToolName]);


  const handleCanvasClick = (event) => {
    // Assuming the image ref holds the currentPredictionImage
    currentPredictionImageRef.current = currentPredictionImage;
  
    // Prevent the default context menu from opening on right click
    if (event.type === 'contextmenu') {
      event.preventDefault();
    }
  
    // Call the processTool function of the current tool
    if (currentTool && currentTool.processTool) {
      // Access the image URL from the ref
      const imageSrc = currentPredictionImageRef.current;
  
      if (imageSrc) {
        // Get the bounding rectangle of the image container
        const rect = event.target.getBoundingClientRect();
        // Calculate the position of the click event relative to the image container
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Construct a new event object with offsetX and offsetY
        const modifiedEvent = {
          ...event,
          offsetX: x,
          offsetY: y,
        };
  
        // Call the tool's process function with the modified event
        currentTool.processTool(dispatch, modifiedEvent, imageSrc, mask, setMask, setMagicWandResultImg);
      } else {
        console.error('No current prediction image found');
      }
    }
  };
  



// useImperativeHandle to exposes these methods to the parent component
useImperativeHandle(ref, () => ({
  UndoLastMaskLine: () => {
    canvasRef.current.undo();
  },
  RedoLastMaskLine: () => {
    canvasRef.current.redo();
  },
}));


const onChange = async () => {
  const paths = await canvasRef.current.exportPaths();
  // Proceed only if there are paths
  if (paths.length > 0) {
    const data = await canvasRef.current.exportImage('svg');
    if (data !== canvasStateRef.current) {
      canvasStateRef.current = data;
      props.onDraw(data);
    }
  }
};


  const predicting = props.isLoading;

  return (
        <div
        className="canvasContainer"
        style={canvasContainerStyle}
        id="canvasContainer"
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasClick} // This is for right-clicks
      >
        {/* PREDICTION IMAGE */}
        {currentPredictionImage && (
            <Image
                alt={`Current prediction ${index}`}
                layout="fill"
                className="absolute animate-in fade-in"
                src={currentPredictionImage}
            />
        )}

        {/* SPINNER */}
        {predicting && (
            <SpinnerOverlay predStatus={props.currentPredictionStatus} />
        )}

        {!predicting && (
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={props.brushSize}
            strokeColor="white"
            canvasColor="transparent"
            onChange={onChange}
            allowOnlyPointerType={allowDrawing ? 'all' : 'none'}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
          />
        )}

        
        {/* Magic Wand Selection Image */}
        {magicWandResultImg && (
          <Image
            src={magicWandResultImg}
            layout='fill'
          />
        )}  

        <Cursor brushSize={props.brushSize} canvasRef={canvasRef} isDrawing={allowDrawing} />
    </div>
    
  );
});

Canvas.displayName = 'Canvas'; // Add display name here
export default Canvas;

function SpinnerOverlay({ predStatus }) {
  // Split the predStatus by newline character and map to render each part on a new line
  const formattedStatus = predStatus ? predStatus.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  )) : 'Server warming up...';

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ zIndex: 100 }}
    >
      <div style={{
        padding: '1rem',
        width: '10rem',
        backgroundColor: 'white',
        textAlign: 'center',
        borderRadius: '0.5rem',
        animation: 'zoom-in',
        animationDuration: '0.3s',
        border: '3px solid #4A90E2', // Light gray border
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' // Soft shadow for depth
      }}>
          <Spinner />
          <p style={{
            paddingTop: '0.75rem',
            opacity: 0.3,
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            {formattedStatus}
          </p>
      </div>
    </div>
  );
}
