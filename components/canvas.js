// getting all the non serializable errors and working on them 
// the tools options now the tools and options aren't working!

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Spinner from 'components/spinner';

const Canvas = (props) => {
  const canvasRef = useRef(null);
  const [allowDrawing, setAllowDrawing] = useState(true);

  useEffect(() => {
    if (!props.currentTool) return; // Early return if currentTool is not defined
  
    // Enable or disable drawing based on the current tool
    setAllowDrawing(props.currentTool.name === 'MaskPainter');
  
    // Determine cursor style based on the tool
    let cursorStyle = 'default';
    if (props.currentTool.name === 'MaskPainter') {
      cursorStyle = `url('/pen-cursor(w)2.png'), auto`;
    } else if (props.currentTool.name === 'Zoom') {
      cursorStyle = 'zoom-in';
    }
  
    console.log("Inside Canvas.js useEffect props.currentTool.name: " + props.currentTool.name);
  
    // Update the cursor style of the canvas
    if (canvasRef.current && canvasRef.current.wrapper) {
      canvasRef.current.wrapper.style.cursor = cursorStyle;
    }
  }, [props.currentTool]);


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
    <div className="relative w-full aspect-square">
        {/* PREDICTION IMAGES */}
        {!props.userUploadedImage && processedPredictions.filter(prediction => prediction.output).map((prediction, index) => (
            <Image
                alt={`prediction ${index}`}
                key={`prediction ${index}`}
                layout="fill"
                className="absolute animate-in fade-in"
                style={{ zIndex: index }}
                src={prediction.lastImage}
            />
        ))}

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
            allowOnlyPointerType={allowDrawing ? 'all' : 'none'}
          />
            </div>
        )}
    </div>
);
};

export default Canvas;
