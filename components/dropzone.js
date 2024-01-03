import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function Dropzone(props) {
  const onImageDropped = props.onImageDropped;

  const preloadImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(reader.result);
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
        onImageDropped(preloadedImage);
      } catch (error) {
        console.error("Error preloading image: ", error);
        // Handle the error as needed
      }
    },
    [onImageDropped]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (props.predictions.length) return null;
  if (props.userUploadedImage) return null;

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
