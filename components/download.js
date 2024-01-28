import { Download as DownloadIcon } from "lucide-react";
import { useSelector } from 'react-redux';

export default function Download(props) {
  // Retrieve the index of the currently selected image from Redux store
  const index = useSelector((state) => state.history.index - 1);

  // Retrieve the corresponding prediction
  const prediction = props.predictions && props.predictions[index]
    ? props.predictions[index]
    : null;

  // Determine the image URL from the prediction
  const imageUrl = prediction && prediction.output && prediction.output.length > 0
    ? prediction.output[prediction.output.length - 1]
    : null;

  console.log('imageUrl', imageUrl);

  if (!imageUrl) return null;

  // Function to download the image
  const downloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob(); // Create a blob from the response

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element and download the image
      const link = document.createElement('a');
      link.href = url;
      link.download = 'downloaded-image.png';
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the image:', error);
    }
  };

  return (
    <button onClick={downloadImage} className="lil-button">
      <DownloadIcon className="icon" />
      Download
    </button>
  );
}
