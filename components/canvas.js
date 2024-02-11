import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import Image from 'next/image';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Spinner from 'components/spinner';
import { tools, getResolution } from './tools/Tools'; // Adjust the import path as necessary
import Cursor from './cursor';
import { useSelector } from 'react-redux';


const Canvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const [allowDrawing, setAllowDrawing] = useState(true);
  const canvasStateRef = useRef(''); // Initialize with an empty string or appropriate initial state
  const [predictionStatus, setPredictionStatus] = props.currentPredictionStatus;
  
  // Assuming index is still derived from Redux or props as before
    const index = useSelector((state) => (state.history.index - 1));

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


/*
  useEffect(() => {
    console.log('*-----------------------------------*');
    console.log('Index:', index);
    console.log('Predictions:', props.predictions);
    console.log('Current Aspect Ratio Name:', currentAspectRatioName);
    console.log('Current Prediction Image:', currentPredictionImage);
  }, [index, props.predictions, currentAspectRatioName, currentPredictionImage]);
  
  useEffect(() => {
    console.log('Allow Drawing:', allowDrawing);
  }, [allowDrawing]);

    useEffect(() => {
    console.log('Current Aspect Ratio Name:', currentAspectRatioName);
    console.log('Calculated Width:', width, 'Calculated Height:', height);
  }, [currentAspectRatioName]);

  useEffect(() => {
    console.log('Canvas Container Style:', canvasContainerStyle);
  }, [canvasContainerStyle]);

*/

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
    <div className="canvasContainer" style={canvasContainerStyle} id="canvasContainer">
        {/* PREDICTION IMAGE */}
        {currentPredictionImage && (
            <Image
                alt={`Current prediction ${index}`}
                layout="fill"
                className="absolute animate-in fade-in"
                src={currentPredictionImage}
            />
        )}

        {/* USER UPLOADED IMAGE */}
        {props.userUploadedImage && (
            <Image
                src={props.userUploadedImage}
                alt="User uploaded"
                layout="fill"
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
        border: '2px solid #e2e8f0', // Light gray border
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
