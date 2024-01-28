import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useSelector } from 'react-redux';
import Spinner from 'components/spinner';
import { tools } from './tools/Tools'; // Adjust the import path as necessary
import Cursor from './cursor';



const Canvas = (props) => {
  const canvasRef = useRef(null);
  const canvasStateRef = useRef(''); // Initialize with an empty string or appropriate initial state
  const [allowDrawing, setAllowDrawing] = useState(true);

  // Retrieve the current image from Redux store
  const currentImage = useSelector((state) => state.history.currentImage);
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const currentTool = tools.find(tool => tool.name === currentToolName);
  const index = useSelector((state) => (state.history.index - 1));

  const currentPredictionImage = props.predictions && props.predictions.length > index && props.predictions[index]
  ? props.predictions[index].output && props.predictions[index].output.length > 0
    ? props.predictions[index].output[props.predictions[index].output.length - 1]
    : null
  : null;

  // Add to your Canvas component
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });


  // Then, use this safely checked currentPredictionImage in your useEffect
  useEffect(() => {
    console.log('Index:', index);
    console.log('Predictions:', props.predictions);
    //console.log('Current Prediction Image:', currentPredictionImage);
  }, [index, props.predictions, currentPredictionImage]);


  
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

 // changed the following code: const predicting = processedPredictions.some(prediction => !prediction.output);
 // to the following code: 
 const predicting = props.isLoading;
  const lastPrediction = processedPredictions[processedPredictions.length - 1];
  console.log('predicting', predicting);

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
                    {lastPrediction ? lastPrediction.status : 'Starting...'}
                    </p>
                </div>
            </div>
        )}

       {(processedPredictions.length > 0 || props.userUploadedImage) && !predicting && (
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: processedPredictions.length + 100 }}
        >
          <React.Fragment>
            <ReactSketchCanvas
              ref={canvasRef}
              strokeWidth={props.brushSize}
              strokeColor="white"
              canvasColor="transparent"
              onChange={onChange}
              allowOnlyPointerType={allowDrawing ? 'all' : 'none'}
            />
            <Cursor brushSize={props.brushSize} canvasRef={canvasRef} isDrawing={allowDrawing} />
          </React.Fragment>
        </div>
      )}
    </div>
);
};

export default Canvas;