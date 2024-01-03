import React, { useRef } from 'react';
import Image from 'next/image';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Spinner from 'components/spinner';

const Canvas = (props) => {
  const canvasRef = useRef(null);

  // Handle the change event for the canvas
  const onChange = async () => {
    const paths = await canvasRef.current.exportPaths();
    if (paths.length) {
      const data = await canvasRef.current.exportImage('svg');
      props.onDraw(data);
    }
  };

  // Process predictions to add lastImage property
  const processedPredictions = props.predictions.map(prediction => ({
    ...prediction,
    lastImage: prediction.output ? prediction.output[prediction.output.length - 1] : null,
  }));

  const predicting = processedPredictions.some(prediction => !prediction.output);
  const lastPrediction = processedPredictions[processedPredictions.length - 1];

  return (
    <div
      className="relative w-full aspect-square"
      style={{
        cursor: `url('/pen-cursor(w)2.png'), auto`
      }}
    >
      {/* PREDICTION IMAGES */}
      {!props.userUploadedImage && processedPredictions.filter(prediction => prediction.output).map((prediction, index) => (
        <Image
          alt={"prediction" + index}
          key={"prediction" + index}
          layout="fill"
          className="absolute animate-in fade-in"
          style={{ zIndex: index }}
          src={prediction.lastImage}
        />
      ))}

      {/* USER UPLOADED IMAGE */}
      {props.userUploadedImage && (
        <Image
          src={props.userUploadedImage}  // Directly use the data URL
          alt="preview image"
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

      {/* CANVAS FOR DRAWING */}
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
          />
        </div>
      )}
    </div>
  );
};

export default Canvas;
