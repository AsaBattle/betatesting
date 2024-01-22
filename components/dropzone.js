import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { pushToUndo } from '../redux/slices/historySlice'; // Adjust the import path as necessary
import { useSelector, useDispatch } from 'react-redux';

export default function Dropzone(props) {
  const dispatch = useDispatch();

  const onImageDropped = props.onImageDropped;

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
          
          console.log("Inside preloadImage width: " + width + " height: " + height);
          if (width > maxSide || height > maxSide) {
            console.log("Inside preloadImage width > maxSide || height > maxSide, so resizing");
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
              resolve(blobReader.result); // This is the Data URL
            };
            blobReader.readAsDataURL(resizedBlob);
          } else {
            resolve(reader.result); // Original Data URL for smaller images
          }
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onDropOld = useCallback(
    async (acceptedFiles) => {
      try {
        const preloadedImage = await preloadImage(acceptedFiles[0]);
        dispatch(pushToUndo(preloadedImage)); // Save the current image before changing it
        onImageDropped(preloadedImage);
      } catch (error) {
        console.error("Error preloading image: ", error);
        // Handle the error as needed
      }
    },
    [onImageDropped]
  );

  const onDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const preloadedImage = await preloadImage(acceptedFiles[0]);
        // Call a new prop function here that will handle the image as the first prediction
        props.onImageAsFirstPrediction(preloadedImage);
      } catch (error) {
        console.error("Error preloading image: ", error);
        // Handle the error as needed
      }
    },
    [props.onImageAsFirstPrediction]
  );
  

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (props.predictions.length) return null;
  //if (props.userUploadedImage) return null;

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
