
/* 3/5/2024
This might be how we do it in the future, if there is a time when we'd like to save each image with its mask
When the magicWandResultImg changes (i.e. when the magic wand tool has finished processing), we need to take it
and store it inside the current predictions magicWantResultImg property. Then when generate is called, we can combine
it with the mask(that ReactSketchCanvas made, which is connected to 'mask' in ImageMode, via ImageMode passing it to canvas
 and canvas "calling" props.onDraw(mask)) and send it to the api.
*/

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import Image from 'next/image';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import Spinner from 'components/spinner';
import { tools, getResolution } from './tools/Tools'; // Adjust the import path as necessary
import Cursor from './cursor';
import { useSelector, useDispatch } from 'react-redux';
import { setCanvasDrawingEnabled } from '../redux/slices/toolSlice';

const addBackgroundToPNG = require("lib/add-background-to-png");

const Canvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const allowDrawing = useSelector((state) => state.toolbar.canvasDrawingEnabled);
  const [controlKeyDown, setControlKeyDown] = useState(false);
  const viewMaskActive = useSelector((state) => state.toolbar.viewMaskActive);
  const canvasStateRef = useRef(''); // Initialize with an empty string or appropriate initial state
  const [predictionStatus, setPredictionStatus] = props.currentPredictionStatus;
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const currentTool = tools.find(tool => tool.name === currentToolName);
  const isToolbarVisible = useSelector((state) => state.toolbar.toolbarVisibility);
  const dispatch = useDispatch();
  const [combinedImg, setCombinedImg] = useState(null); // Holds the combined image of the magic wand tool and the ReactSketchCanvas mask
  const [mask, setMask] = useState(null); // Holds the mask used by the magic wand tool
  const [magicWandResultImg, setMagicWandResultImg] = useState(null); // Holds the resulting image of the magic wand tool
  const magicWandTolerance = useSelector((state) => state.toolbar.tolerance);

  // Assuming index is still derived from Redux or props as before
  const index = useSelector((state) => (state.history.index - 1));
  const currentPredictionImageRef = useRef();
  const [sketchMask, setSketchMask] = useState(null);


    const currentPredictionImage = useMemo(() => {
      return props.predictions && props.predictions.length > index && props.predictions[index]
        ? props.predictions[index].output && props.predictions[index].output.length > 0
          ? props.predictions[index].output[props.predictions[index].output.length - 1]
          : null
        : null;
    }, [props.predictions, index]);
    
    const currentPredictionMagicWandMask = useMemo(() => {
      return props.predictions && props.predictions.length > index && props.predictions[index]
        ? props.predictions[index].magicWandMask
        : null;
    }, [props.predictions, index]);

  // Calculate aspect ratio from the current prediction if available
  const currentAspectRatioName = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].aspectRatioName
    : 'default'; // Default or fallback aspect ratio


  const { width, height } = getResolution(currentAspectRatioName);

  const isTall = false; //height > width;
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
    const keyDownHandler = (event) => {
      if (event.key === 'Control') {
        setControlKeyDown(true);
      }
    };
  
    const keyUpHandler = (event) => {
      if (event.key === 'Control') {
        setControlKeyDown(false);
      }
    };
  
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
  
    // Cleanup function to remove the event listeners when the component unmounts
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount



  useEffect(() => {
    console.log("Version 1.0.1");
  }, []);



  useEffect(() => {
    if (!currentTool) {
      console.error('Current tool is not defined.');
      return;
    }

    if (currentToolName === 'NoTool') {
      console.log('Drawing is Disabled because currentToolName is NoTool');
      dispatch(setCanvasDrawingEnabled(false));
    } else {
      console.log('Drawing is Enabled because currentToolName is not NoTool');
      dispatch(setCanvasDrawingEnabled(currentToolName !== 'NoTool'));
    }

    const canvasContainer = document.getElementById('canvasContainer');
    if (!canvasContainer) {
      console.error('Canvas container id not found');
      return;
    }
    
    canvasContainer.style.cursor = currentTool.cursor;
  }, [currentToolName]);

  
  
  useEffect(() => {
    // We don't want to set drawing enabled if the toolbar is visible or if the current tool is NoTool
    if (currentToolName === 'NoTool') 
      return;

    console.log('Inside isToolbarVisible ---> Setting canvas drawing enabled:', !isToolbarVisible);
    dispatch(setCanvasDrawingEnabled(!isToolbarVisible));
  }, [isToolbarVisible]);


  useEffect(() => {
    if (props.predictions.length <= 0) {
      dispatch(setCanvasDrawingEnabled(false));
    }
  }, [props.predictions.length]);


  const handleCanvasClick = (event) => {
    if (!allowDrawing) {
      console.log('Drawing is disabled, in handleCanvasClick');
      return;
    }  else {
      console.log('Drawing is enabled, in handleCanvasClick');
    }


    const cc = document.getElementById('canvasContainer');
    //console.log('Canvascontainer: ', cc);
  
    // Get the bounding rectangle of the image container
    const rect = event.target.getBoundingClientRect();
  
    // Log the rendered size of the element
    //console.log('Rendered size:', rect.width, 'x', rect.height);
  
    // Assuming the image ref holds the currentPredictionImage
    currentPredictionImageRef.current = (currentPredictionMagicWandMask)?currentPredictionMagicWandMask:currentPredictionImage;
  
    // Prevent the default context menu from opening on right click
    if (event.type === 'contextmenu') {
      event.preventDefault();
    }
  
    // Call the processTool function of the current tool
    if (currentTool && currentTool.processTool) {

      // Access the image URL from the ref
      const imageSrc = currentPredictionImageRef.current;
  
      if (imageSrc) {
        // Get the bounding rectangle of the image container again
        // (no need to get it again if it has not changed)
        // Calculate the scale factors based on the natural size of the image
        // Replace these with the actual natural size if it's not 1024x1024
        const naturalWidth = width; // Replace with the actual natural width if necessary
        const naturalHeight = height; // Replace with the actual natural height if necessary
        const scaleX = rect.width / naturalWidth;
        const scaleY = rect.height / naturalHeight;
  
        // Calculate the position of the click event relative to the image container
        const x = (event.clientX - rect.left) / scaleX;
        const y = (event  .clientY - rect.top) / scaleY;
  
        // Construct a new event object with offsetX and offsetY scaled
        const modifiedEvent = {
          ...event,
          offsetX: x,
          offsetY: y,
          // Additional properties in case they are needed for context
          scale: { x: scaleX, y: scaleY },
          rect: { ...rect },
          naturalSize: { width: naturalWidth, height: naturalHeight },
          clientX: event.clientX,
          clientY: event.clientY,
        };
  
        //console.log('Canvas.js: modifiedEvent: ', modifiedEvent);

        // Call the tool's process function with the modified event
        currentTool.processTool(dispatch, modifiedEvent, imageSrc, mask, setMask, setMagicWandResultImg, magicWandTolerance, controlKeyDown);
      // if (magicWandResultImg)
      // magicWandResultImg = addBackgroundToPNG(magicWandResultImg);
      } else {
        console.error('No current prediction image found');
      }
    }
  };


const combineImages = async (img1, img2, width, height) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    const image1 = new window.Image();
    image1.onload = () => {
      ctx.drawImage(image1, 0, 0, width, height);

      const image2 = new window.Image();
      image2.onload = () => {
        ctx.drawImage(image2, 0, 0, width, height);
        resolve(canvas.toDataURL());
      };
      image2.src = img2;
    };
    image1.src = img1;
  });
};



// Expose these methods to the parent component
useImperativeHandle(ref, () => ({

  getCombinedMask: async () => {
    let combinedImage = null;

    if (sketchMask && !magicWandResultImg){
      combinedImage = sketchMask;
      console.log('No magic wand result, using sketchMask');
    }
    else if (magicWandResultImg && !sketchMask) {
      combinedImage = await addBackgroundToPNG(magicWandResultImg);
      console.log('No sketchMask, using magicWandResultImg');
    }
    else
    // If the magic wand tool has been used, then combine its results
    // with the ReactSketchCanvas mask if it exists
    if (magicWandResultImg && sketchMask) {
        //console.log('magicWandResultImg and sketchMask exist, combining images');
        const tmp = await addBackgroundToPNG(magicWandResultImg);
        combinedImage = await combineImages(tmp, sketchMask, width, height);
    }

    return combinedImage;
  },

  setCombinedMask: (img) => {
    setCombinedImg(img);
  },

  ClearMagicWandResult: () => {
    console.log("Clearing magic wand result");
    setMagicWandResultImg(null);
  },
  UndoLastMaskLine: () => {
    console.log("Undoing last mask line");
    canvasRef.current.undo();
  },  
  RedoLastMaskLine: () => {
    console.log("Redoing last mask line");
    canvasRef.current.redo();
  },
  ClearMaskLines: () => {
    console.log("Clearing mask lines");
    canvasRef.current.resetCanvas();
  },
}));


const onChange = async () => {
  let data;
  let dataWasSet = false;
  const paths = await canvasRef.current.exportPaths();

  // Proceed only if there are paths
  if (paths.length > 0) {
    data = await canvasRef.current.exportImage('svg');
    if (data !== canvasStateRef.current) {
      canvasStateRef.current = data;
      dataWasSet = true;
     //console.log("Set props.onDraw(data) in Canvas.js");
      setSketchMask(data);
      //props.onDraw(data);
    }
  }
};


useEffect(() => {
  if (props.clearMask) {
     magicWandResultImg = null;
  }
}, [props.clearMask]);

function findScale(elementId) {
  // Assuming 'element' is the DOM element you want to check
  var element = document.getElementById(elementId);

  // Get the computed style of the element
  var style = window.getComputedStyle(element);

  console.log('Style:', style);

  // Get the relevant transformation values
  var transform = style.transform || style.webkitTransform || style.mozTransform;

  // Log the transform properties to the console
  console.log('Transform:', transform);

  // If you need to get the scale specifically
  var matrix = transform.match(/^matrix\((.+)\)$/);
  if (matrix) {
      var values = matrix[1].split(', ');
      var scaleX = parseFloat(values[0]);
      var scaleY = parseFloat(values[3]);
      console.log('ScaleX:', scaleX, 'ScaleY:', scaleY);
  }

  return { scaleX, scaleY };
}



useEffect(() => {
  if (props.generateClicked) {
    setMagicWandResultImg(null);
  }
}, [props.generateClicked]);



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
      {currentPredictionImage && !viewMaskActive && (
        <Image
          alt={`Current prediction ${index}`}
          layout="fill"
          className="absolute animate-in fade-in"
          src={currentPredictionImage}
        />
      )}

      {/* PREDICTION IMAGE */}
      {viewMaskActive && (
        <Image
          alt={`Current prediction ${index}`}
          layout="fill"
          className="absolute animate-in fade-in"
          src={currentPredictionMagicWandMask}
        />
      )}
      


  
      {/* SPINNER */}
      {predicting && (
        <SpinnerOverlay predStatus={props.currentPredictionStatus} />
      )}
  
      {!predicting && (
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={(currentToolName !== 'MaskPainter')?0:props.brushSize}
          strokeColor="white"
          canvasColor="transparent"
          onChange={onChange}
          allowOnlyPointerType={allowDrawing ? 'all' : 'none'}
          readOnly={allowDrawing}
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
  
      <Cursor brushSize={(currentToolName !== 'MaskPainter')?0:props.brushSize} canvasRef={canvasRef} isDrawing={allowDrawing} />
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
  )) : 'Processing...';

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
