import { set } from 'lodash';
import { Wand2, Brush, ZoomIn, Divide, CircleOff } from 'lucide-react';

function concatMasks(mask, old) {
	let 
  	data1 = old.data,
		data2 = mask.data,
		w1 = old.width,
		w2 = mask.width,
		b1 = old.bounds,
		b2 = mask.bounds,
		b = { // bounds for new mask
			minX: Math.min(b1.minX, b2.minX),
			minY: Math.min(b1.minY, b2.minY),
			maxX: Math.max(b1.maxX, b2.maxX),
			maxY: Math.max(b1.maxY, b2.maxY)
		},
		w = old.width, // size for new mask
		h = old.height,
		i, j, k, k1, k2, len;

	let result = new Uint8Array(w * h);

	// copy all old mask
	len = b1.maxX - b1.minX + 1;
	i = b1.minY * w + b1.minX;
	k1 = b1.minY * w1 + b1.minX;
	k2 = b1.maxY * w1 + b1.minX + 1;
	// walk through rows (Y)
	for (k = k1; k < k2; k += w1) {
		result.set(data1.subarray(k, k + len), i); // copy row
		i += w;
	}

	// copy new mask (only "black" pixels)
	len = b2.maxX - b2.minX + 1;
	i = b2.minY * w + b2.minX;
	k1 = b2.minY * w2 + b2.minX;
	k2 = b2.maxY * w2 + b2.minX + 1;
	// walk through rows (Y)
	for (k = k1; k < k2; k += w2) {
		// walk through cols (X)
		for (j = 0; j < len; j++) {
			if (data2[k + j] === 1) result[i + j] = 1;
		}
		i += w;
	}

	return {
		data: result,
		width: w,
		height: h,
		bounds: b
	};
}


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
  console.log("Setting up canvas - width: ", canvas.width, "height: ", canvas.height);
  ctx.drawImage(image, 0, 0);
  return { hiddenCanvas: canvas, ctx };
}

// takes the mask are turns a black rgba image with rest being transparent
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




// takes the mask are turns a white rgba image with rest being transparent
function createResultImageDataArray2(mask) {
  const array = new Uint8ClampedArray(mask.width * mask.height * 4);
  // Loop through the mask data to set pixel values
  for (let i = 0; i < mask.data.length; i++) {
    const idx = i * 4;
    array[idx] = 255;      // R
    array[idx + 1] = 255;  // G
    array[idx + 2] = 255;  // B
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


const magicWandTool = {
  name: 'Wand',
  label: 'Magic Wand',
  icon: <Wand2 />,
  renderInToolbar: true,
  cursor: `url('/wand2.png'), auto`,
  setup: function (canvasReference) {
    // setup function can remain empty if all logic is in processTool
  },

 
  processTool: function (dispatch, event, imageSrc, previousMask, setMask, setResultImg, tolerance, combine) {
    loadImage(imageSrc).then(image => {
      const { hiddenCanvas, ctx } = setupCanvas(image);
      const imageData = ctx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);

      const x = Math.round(event.offsetX);
      const y = Math.round(event.offsetY);

      const newMask = floodFillWithoutBorders(imageData, x, y, tolerance, null); // Assuming currentMask isn't needed directly

      const borderMask = newMask;// MagicWand.gaussBlurOnlyBorder(newMask, 15, null);

      // Use concatMasks if previousMask exists, else use borderMask directly
      const resultMask = (previousMask && combine) ? concatMasks(borderMask, previousMask) : borderMask;

      // The new combined mask
      setMask(resultMask); // Assuming setMask updates the state that stores the current/previous mask

      const resultImageDataArray = createResultImageDataArray2(resultMask);
      const resultImageData = new ImageData(resultImageDataArray, resultMask.width, resultMask.height);
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
  magicWandTool,
  {
    name: 'AspectRatio',
    label: 'Aspect Ratio',
    icon: <Divide />,
    renderInToolbar: true,
    cursor: 'zoom-in',
    setup: function (canvasReference) {
      console.log('Setting up aspect ratio');
    },
    processTool: function (dispatch, event) {
      console.log('Processing aspect ratio');
    }
  },
  { 
    name: 'NoTool',
    label: 'No Tool Selected',
    icon: <CircleOff />, 
    renderInToolbar: true, 
    cursor: 'zoom-in',
   setup: (canvasReference) => {
      canvasRef = canvasReference
      console.log('Setting No Tool selected tool');
    },

    processTool: (dispatch,event) => {
      console.log('Processing No Tool selected tool');
    }
  },
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