import { Download as DownloadIcon } from "lucide-react";

export default function Download(props) {
  if (!props.predictions.length) return null;

  const lastPrediction = props.predictions[props.predictions.length - 1];

  if (!lastPrediction.output) return null;

  const lastImage = lastPrediction.output[lastPrediction.output.length - 1];

  // Function to download the image
  const downloadImage = async () => {
    // Fetch the image
    const response = await fetch(lastImage);
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
  };

  return (
    <button onClick={downloadImage} className="lil-button">
      <DownloadIcon className="icon" />
      Download
    </button>
  );
}
