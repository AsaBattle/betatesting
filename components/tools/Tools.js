import { Wand2, Brush, ZoomIn } from 'lucide-react';
import MagicWand from 'magic-wand-tool';


function floodFillWithoutBorders(image, px, py, colorThreshold, mask) {

  if (!image) {
    console.log('Image is undefined or not provided');
    return null;
  }

  if (!image.data) {
    console.log('Image.data is undefined or not provided');
    return null;
  }

  var c, x, newY, el, xr, xl, dy, dyl, dyr, checkY, data = image.data, w = image.width, h = image.height, bytes = 4, // number of bytes in the color
  maxX = -1, minX = w + 1, maxY = -1, minY = h + 1, i = py * w + px, // start point index in the mask data
  result = new Uint8Array(w * h), // result mask
  visited = new Uint8Array(mask ? mask : w * h);
  // mask of visited points

  if (visited[i] === 1)
      return null;

  i = i * bytes;

  // Before using `data.length`, ensure `data` is defined
  if (!data) {
    console.log('data is undefined');
    return null;
  }
  console.log(`Calculated index (i): ${i}, Data length: ${data.length}`);
if (i < 0 || i + 3 >= data.length) {
  console.error(`Index out of bounds: ${i}`);
  return null; // Or handle the error as appropriate
}


  // start point index in the image data
  var sampleColor = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  // start point color (sample)

  var stack = [{
      y: py,
      left: px - 1,
      right: px + 1,
      dir: 1
  }];
  // first scanning line
  do {
      el = stack.shift();
      // get line for scanning

      checkY = false;
      for (x = el.left + 1; x < el.right; x++) {
          dy = el.y * w;
          i = (dy + x) * bytes;
          // point index in the image data

          if (visited[dy + x] === 1)
              continue;
          // check whether the point has been visited
          // compare the color of the sample
          c = data[i] - sampleColor[0];
          // check by red
          if (c > colorThreshold || c < -colorThreshold)
              continue;
          c = data[i + 1] - sampleColor[1];
          // check by green
          if (c > colorThreshold || c < -colorThreshold)
              continue;
          c = data[i + 2] - sampleColor[2];
          // check by blue
          if (c > colorThreshold || c < -colorThreshold)
              continue;

          checkY = true;
          // if the color of the new point(x,y) is similar to the sample color need to check minmax for Y 

          result[dy + x] = 1;
          // mark a new point in mask
          visited[dy + x] = 1;
          // mark a new point as visited

          xl = x - 1;
          // walk to left side starting with the left neighbor
          while (xl > -1) {
              dyl = dy + xl;
              i = dyl * bytes;
              // point index in the image data
              if (visited[dyl] === 1)
                  break;
              // check whether the point has been visited
              // compare the color of the sample
              c = data[i] - sampleColor[0];
              // check by red
              if (c > colorThreshold || c < -colorThreshold)
                  break;
              c = data[i + 1] - sampleColor[1];
              // check by green
              if (c > colorThreshold || c < -colorThreshold)
                  break;
              c = data[i + 2] - sampleColor[2];
              // check by blue
              if (c > colorThreshold || c < -colorThreshold)
                  break;

              result[dyl] = 1;
              visited[dyl] = 1;

              xl--;
          }
          xr = x + 1;
          // walk to right side starting with the right neighbor
          while (xr < w) {
              dyr = dy + xr;
              i = dyr * bytes;
              // index point in the image data
              if (visited[dyr] === 1)
                  break;
              // check whether the point has been visited
              // compare the color of the sample
              c = data[i] - sampleColor[0];
              // check by red
              if (c > colorThreshold || c < -colorThreshold)
                  break;
              c = data[i + 1] - sampleColor[1];
              // check by green
              if (c > colorThreshold || c < -colorThreshold)
                  break;
              c = data[i + 2] - sampleColor[2];
              // check by blue
              if (c > colorThreshold || c < -colorThreshold)
                  break;

              result[dyr] = 1;
              visited[dyr] = 1;

              xr++;
          }

          // check minmax for X
          if (xl < minX)
              minX = xl + 1;
          if (xr > maxX)
              maxX = xr - 1;

          newY = el.y - el.dir;
          if (newY >= 0 && newY < h) {
              // add two scanning lines in the opposite direction (y - dir) if necessary
              if (xl < el.left)
                  stack.push({
                      y: newY,
                      left: xl,
                      right: el.left,
                      dir: -el.dir
                  });
              // from "new left" to "current left"
              if (el.right < xr)
                  stack.push({
                      y: newY,
                      left: el.right,
                      right: xr,
                      dir: -el.dir
                  });
              // from "current right" to "new right"
          }
          newY = el.y + el.dir;
          if (newY >= 0 && newY < h) {
              // add the scanning line in the direction (y + dir) if necessary
              if (xl < xr)
                  stack.push({
                      y: newY,
                      left: xl,
                      right: xr,
                      dir: el.dir
                  });
              // from "new left" to "new right"
          }
      }
      // check minmax for Y if necessary
      if (checkY) {
          if (el.y < minY)
              minY = el.y;
          if (el.y > maxY)
              maxY = el.y;
      }
  } while (stack.length > 0);

  return {
      data: result,
      width: image.width,
      height: image.height,
      bounds: {
          minX: minX,
          minY: minY,
          maxX: maxX,
          maxY: maxY
      }
  };
}


// Utility functions
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "Anonymous"; // Handle CORS
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function setupCanvas(image) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  return { hiddenCanvas: canvas, ctx };
}

function createResultImageDataArray(mask) {
  const array = new Uint8ClampedArray(mask.width * mask.height * 4);
  // Loop through the mask data to set pixel values
  for (let i = 0; i < mask.data.length; i++) {
    const idx = i * 4;
    array[idx] = 0;      // R
    array[idx + 1] = 0;  // G
    array[idx + 2] = 0;  // B
    array[idx + 3] = mask.data[i] ? 255 : 0; // Alpha value based on mask
  }
  return array;
}

export function getResolution(aspectRatioName) {
  switch (aspectRatioName) {
    case '1:1':
      return { width: 1024, height: 1024, displayWidth: 512 };
    case '16:9':
      return { width: 1024, height: 576, displayWidth: 512 };
    case '9:16':
      return { width: 576, height: 1024, displayWidth: 348 };
    case '4:3':
      return { width: 1024, height: 768, displayWidth: 512 };
    case '3:4':
      return { width: 768, height: 1024, displayWidth: 512 };
    default:
      return { width: 1024, height: 1024, displayWidth: 512 }; // Default 1:1 aspect ratio
  }
}


//the code now works, except the x,y coordinates are not being passed/process correctly
// also, it floodfill and doesn't give the outline, probably because we left out the gaussian blur since 
 //we are using the magic wand tool and we need to add the gaussian blur to the code so that it can give the outline of the mask

const magicWandTool = {
  name: 'Wand',
  label: 'Magic Wand',
  icon: <Wand2 />,
  renderInToolbar: true,
  cursor: `url('/wand2.png'), auto`,
  setup: function (canvasReference) {
    // setup function can remain empty if all logic is in processTool
  },

 
processTool: function (dispatch, event, imageSrc, currentMask, setMask, setResultImg) {
  loadImage(imageSrc).then(image => {
    const { hiddenCanvas, ctx } = setupCanvas(image);
    const imageData = ctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    // ...checks for imageData...
    const x = Math.round(event.offsetX);
    const y = Math.round(event.offsetY);
    const tolerance = 15;
    const newMask = floodFillWithoutBorders(imageData, x, y, tolerance, currentMask);
    // ...check newMask validity...
    const resultImageDataArray = createResultImageDataArray(newMask);
    const resultImageData = new ImageData(resultImageDataArray, newMask.width, newMask.height);
    ctx.putImageData(resultImageData, 0, 0);
    setResultImg(hiddenCanvas.toDataURL());
    hiddenCanvas.remove();
  }).catch(error => {
    console.error('Error processing the magic wand tool:', error);
  });
}
  
};

export const tools = [
  {
    name: 'MaskPainter',
    label: 'Mask Painter',
    icon: <Brush />,
    cursor: `url('/pen-cursor(w)2.png'), auto`,
    renderInToolbar: true,
    setup: function (canvasReference) {
      console.log('Setting up MaskPainter');
    },
    processTool: function (dispatch, event) {
      console.log('Processing MaskPainter');
    }
  },
  {
    name: 'AspectRatio',
    label: 'Aspect Ratio',
    icon: <ZoomIn />,
    renderInToolbar: false,
    cursor: 'zoom-in',
    setup: function (canvasReference) {
      console.log('Setting up aspect ratio');
    },
    processTool: function (dispatch, event) {
      console.log('Processing aspect ratio');
    }
  },
  magicWandTool
   /*{ 
    name: 'Zoom',
    label: 'Zoom In/Out',
    icon: <ZoomIn />, 
    renderInToolbar: true, 
    cursor: 'zoom-in',
   setup: (canvasReference) => {
      canvasRef = canvasReference
      console.log('Setting zoom tool');
    },

    processTool: (dispatch,event) => {
      console.log('Processing zoom tool');
      if (event.type === 'contextmenu') {
        console.log('Zoom Right click');
      }
      if (event.type === 'click') {
        console.log('Zoom Left click');
      }
    }
  },*/ 
]; 