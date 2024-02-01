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

  // Assuming index is still derived from Redux or props as before
  const index = useSelector((state) => (state.history.index - 1));

  // Use the aspect ratio from the current prediction in the array, similar to your second version
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

  // This line and related calculations for currentPredictionImage remain as you requested
  const currentPredictionImage = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].output && props.predictions[index].output.length > 0
      ? props.predictions[index].output[props.predictions[index].output.length - 1]
      : null
    : null;

  useEffect(() => {
    console.log('*-----------------------------------*');
    console.log('Index:', index);
    console.log('Predictions:', props.predictions);
  }, [index, props.predictions, currentPredictionImage]);

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
            <SpinnerOverlay prediction={props.predictions[props.predictions.length - 1]} />
        )}

        {!predicting && (
          <React.Fragment>
            <ReactSketchCanvas
              ref={canvasRef}
              strokeWidth={props.brushSize}
              strokeColor="white"
              canvasColor="transparent"
              onChange={onChange}
              allowOnlyPointerType={allowDrawing ? 'all' : 'none'}
              style={{ position: 'absolute', top: 0, left:   0, right: 0, bottom: 0, zIndex: 10 }}
            />
            <Cursor brushSize={props.brushSize} canvasRef={canvasRef} isDrawing={allowDrawing} />
          </React.Fragment>
        )}
    </div>
  );
};

export default Canvas;

function SpinnerOverlay({ prediction }) {
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ zIndex: 100 }}
    >
      <div className="p-4 w-40 bg-white text-center rounded-lg animate-in zoom-in">
          <Spinner />
          <p className="pt-3 opacity-30 text-center text-sm">
          {prediction ? prediction.status : 'Starting...'}
          </p>
      </div>
    </div>
  );
}
