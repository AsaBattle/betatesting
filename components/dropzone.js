import React, { useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { pushToUndo } from '../redux/slices/historySlice';
import { useSelector, useDispatch } from 'react-redux';
import { setAspectRatio } from '../redux/slices/toolSlice'; // Adjust the import path as necessary

export default function Dropzone(props) {
  const dispatch = useDispatch();

  const onImageDropped = props.onImageAsFirstPrediction;
  const currentAspectRatioName = useSelector((state) => state.toolbar.aspectRatioName); 
  let aspectRatioName = 'none';


  const calculateAspectRatio = (width, height) => {
    // Define your aspect ratios and names here
    const aspectRatios = {
      '1:1': 1,
      '16:9': 16 / 9,
      '9:16': 9 / 16,
      '43': 4 / 3,
      '34': 3 / 4,
    };

    let closestAspectRatioName = '1:1';
    let smallestDifference = Infinity;
    const imageAspectRatio = width / height;

    Object.entries(aspectRatios).forEach(([name, ratio]) => {
      const difference = Math.abs(ratio - imageAspectRatio);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestAspectRatioName = name;
      }
    });

    return closestAspectRatioName;
  };

  const resizeImage = (image, targetWidth, targetHeight) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(resolve, 'image/jpeg');
    });
  };

  const preloadImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const img = new Image();
        img.onload = async () => {
          let width = img.width;
          let height = img.height;
          const maxSide = 1024;

          // Update Redux store with the closest aspect ratio
          aspectRatioName = calculateAspectRatio(width, height);

          console.log('Setting aspect ratio to: ', aspectRatioName);
          dispatch(setAspectRatio(aspectRatioName));

          if (width > maxSide || height > maxSide) {
            const ratio = width / height;
            if (ratio > 1) { // wider
              width = maxSide;
              height = maxSide / ratio;
            } else { // taller or square
              height = maxSide;
              width = maxSide * ratio;
            }
  
            const resizedBlob = await resizeImage(img, width, height);
            const blobReader = new FileReader();
            blobReader.onloadend = function() {
              resolve(blobReader.result);
            };
            blobReader.readAsDataURL(resizedBlob);
          } else {
            resolve(reader.result);
          }
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const preloadedImage = await preloadImage(acceptedFiles[0]);
        onImageDropped(preloadedImage,aspectRatioName);
      } catch (error) {
        console.error("Error preloading image: ", error);
      }
    },
    [onImageDropped, dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (props.predictions.length) return null;

  return (
    <div
      className="absolute z-50 flex w-full h-full text-gray-500 text-sm text-center cursor-pointer select-none"
      {...getRootProps()}
    >
      <div className="m-auto">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the image here ...</p>
        ) : (
          <p>Optional: Drag and drop a starting image here</p>
        )}
      </div>
    </div>
  );
}
