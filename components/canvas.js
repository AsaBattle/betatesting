/* before gpt had it doing this inside of the return statement
{currentImage && (
  <Image
      src={currentImage}
      alt="Current Canvas Content"
      layout="fill"
      className="absolute z-10"
  />
)}
But that messes it up when undo is executed, just doesn't work right. The version of it is below but commented out
*/
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useSelector } from 'react-redux';
import Spinner from 'components/spinner';
import { tools } from './tools/Tools'; // Adjust the import path as necessary

const Canvas = (props) => {
  const canvasRef = useRef(null);
  const canvasStateRef = useRef(''); // Initialize with an empty string or appropriate initial state
  const [allowDrawing, setAllowDrawing] = useState(true);

  // Retrieve the current image from Redux store
  const currentImage = useSelector((state) => state.history.currentImage);
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const currentTool = tools.find(tool => tool.name === currentToolName);

 //Trying to get the index to not go out of bounds and to update to the newest image generated


  const index = useSelector((state) => (state.history.index - 1));


  //const currentPredictionImage = props.predictions.length > index ? props.predictions[index].output : null;
const currentPredictionImage = props.predictions && props.predictions.length > index && props.predictions[index]
  ? props.predictions[index].output && props.predictions[index].output.length > 0
    ? props.predictions[index].output[props.predictions[index].output.length - 1]
    : null
  : null;
// Add to your Canvas component
const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

useEffect(() => {
  const canvasContainer = document.getElementById('canvasContainer');
  const onMouseMove = (e) => {
    const rect = canvasContainer.getBoundingClientRect();
    // Check if the mouse is inside the canvasContainer boundaries
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else {
      // Reset or set cursor position to null or some other state to indicate it's out of bounds
      setCursorPos(null);
    }
  };

  if (canvasContainer && currentToolName === 'MaskPainter') {
    canvasContainer.addEventListener('mousemove', onMouseMove);
  }

  return () => {
    if (canvasContainer) {
      canvasContainer.removeEventListener('mousemove', onMouseMove);
    }
  };
}, [currentToolName]);

// Then, use this safely checked currentPredictionImage in your useEffect
useEffect(() => {
  console.log('Index:', index);
  console.log('Predictions:', props.predictions);
  console.log('Current Prediction Image:', currentPredictionImage);
}, [index, props.predictions, currentPredictionImage]);

  useEffect(() => {
    if (!currentTool) {
      console.error('Current tool is not defined.');
      return;
    }

    console.log("Inside Canvas.js useEffect currentTool.name: " + currentTool.name);
  
    setAllowDrawing(currentToolName === 'MaskPainter');
  
    const canvasContainer = document.getElementById('canvasContainer');
    if (!canvasContainer) {
      console.error('Canvas container id not found');
      return;
    }
    canvasContainer.style.cursor = currentTool.cursor;
  }, [currentToolName]);

  // Process predictions to add lastImage property
  const processedPredictions = props.predictions.map(prediction => ({
    ...prediction,
    lastImage: prediction.output ? prediction.output[prediction.output.length - 1] : null,
  }));

// Handle the change event for the canvas
const onChange = async () => {
  const paths = await canvasRef.current.exportPaths();
  if (paths.length) {
    const data = await canvasRef.current.exportImage('svg');
    if (data !== canvasStateRef.current) {
      // Push the current state to undo stack before updating, but only if we want to save the current image evert time the user hits the mouse(meaning when the canvas changes)
      // dispatch(pushToUndo(canvasStateRef.current));
      canvasStateRef.current = data;
    }
    props.onDraw(data);
  }
};

  const predicting = processedPredictions.some(prediction => !prediction.output);
  const lastPrediction = processedPredictions[processedPredictions.length - 1];

  return (
    <div className="relative w-full aspect-square" id="canvasContainer" style={{
      cursor: `url('/pen-cursor(w)2.png'), auto`
    }}>
        {/* PREDICTION IMAGE */}
        {currentPredictionImage && (
            <Image
                alt={`Current prediction ${index}`}
                layout="fill"
                className="absolute animate-in fade-in"
                style={{ zIndex: 100 }}  // Make sure to set a proper z-index
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
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: processedPredictions.length + 100 }}
            >
                <div className="p-4 w-40 bg-white text-center rounded-lg animate-in zoom-in">
                    <Spinner />
                    <p className="pt-3 opacity-30 text-center text-sm">
                        {lastPrediction.status}
                    </p>
                </div>
            </div>
        )}

       {(processedPredictions.length > 0 || props.userUploadedImage) && !predicting && (
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: processedPredictions.length + 100 }}
        >
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={props.brushSize}
            strokeColor="white"
            canvasColor="transparent"
            onChange={onChange}
            allowOnlyPointerType={allowDrawing ? 'all' : 'none'}
          />
          {currentToolName === 'MaskPainter' && cursorPos && (
          <div
            style={{
              position: 'absolute',
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              width: `${props.brushSize}px`,
              height: `${props.brushSize}px`,
              marginLeft: `-${props.brushSize / 2}px`, // to center the circle
              marginTop: `-${props.brushSize / 2}px`, // to center the circle
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.5)', // semi-transparent white circle
              pointerEvents: 'none', // allows the mouse events to pass through the div
            }}
          />
        )}
        </div>
      )}
    </div>
);
};

export default Canvas;