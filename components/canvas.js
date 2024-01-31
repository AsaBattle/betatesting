import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { useSelector } from 'react-redux';
import Spinner from 'components/spinner';
import { tools, getResolution } from './tools/Tools'; // Adjust the import path as necessary
import Cursor from './cursor';

const Canvas = (props) => {
  const canvasRef = useRef(null);
  const canvasStateRef = useRef(''); // Initialize with an empty string or appropriate initial state
  const [allowDrawing, setAllowDrawing] = useState(true);

  const aspectRatioName = useSelector((state) => state.toolbar.aspectRatioName);
  const { width, height } = getResolution(aspectRatioName);

  // Decide if the aspect ratio is 'tall' (height is greater than width)
  const isTall = false;

  // Styles for the container that maintains aspect ratio
  const canvasContainerStyle = isTall ? {
    height: '80vh',
    maxWidth: '100%', // Ensure the width does not exceed the viewport width
    width: `min(${(width / height) * 80}vh, 100%)`, // Adjust width calculation
    position: 'relative',
    overflow: 'hidden', // Prevent overflow
    zIndex: 10, // Ensure this is below interactive elements' zIndex
  } : {
    width: '100%',
    paddingTop: `${(height / width) * 100}%`,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 10,
  };

  // Cursor style should be applied only to the ReactSketchCanvas for drawing
  const canvasStyle = {
    cursor: allowDrawing ? `url('/pen-cursor(w)2.png'), auto` : 'default',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }; 
  
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

/*
  useEffect(() => {
    console.log('Aspect Ratio:', aspectRatioName); // Log the current aspect ratio
    console.log('Width and Height from getResolution:', width, height);
    let containerWidth, containerHeight;

    if (isTall) {
        // For tall aspect ratios, use the viewport height to calculate the size
        containerHeight = window.innerHeight * 0.8; // 80vh as per your style
        containerWidth = (width / height) * containerHeight;
    } else {
        // For other aspect ratios, calculate based on the viewport width
        containerWidth = window.innerWidth; // Assuming full width
        containerHeight = (height / width) * containerWidth;

        // Adjust for maximum width
        if (containerWidth > window.innerWidth) {
            containerWidth = window.innerWidth;
            containerHeight = (height / width) * containerWidth;
        }
    }

    console.log('Calculated Container Size:', containerWidth, containerHeight);

    if (containerWidth !== canvasStateRef.current.width || containerHeight !== canvasStateRef.current.height) {
        props.onCanvasSizeChange({ width: containerWidth, height: containerHeight });
        canvasStateRef.current = { width: containerWidth, height: containerHeight };
    }
}, [width, height, isTall, props.onCanvasSizeChange]);
*/

  useEffect(() => {
    console.log('Index:', index);
    console.log('Predictions:', props.predictions);
  }, [index, props.predictions, currentPredictionImage]);

  const processedPredictions = props.predictions.map(prediction => ({
    ...prediction,
    lastImage: prediction.output ? prediction.output[prediction.output.length - 1] : null,
  }));

  const onChange = async () => {
    const paths = await canvasRef.current.exportPaths();
    if (paths.length) {
      const data = await canvasRef.current.exportImage('svg');
      if (data !== canvasStateRef.current) {
        canvasStateRef.current = data;
      }
      props.onDraw(data);
    }
  };

  const predicting = props.isLoading;
  const lastPrediction = processedPredictions[processedPredictions.length - 1];

  return (
    <div className="canvasContainer" style={canvasContainerStyle} id="canvasContainer">
        {/* PREDICTION IMAGE */}
        {currentPredictionImage && (
            <Image
                alt={`Current prediction ${index}`}
                layout="fill"
                className="absolute animate-in fade-in"
                style={{ zIndex: 100 }}
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
