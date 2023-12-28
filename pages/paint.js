import { useState, useEffect } from "react";
import Head from "next/head";
import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Dropzone from "components/dropzone";
import Download from "components/download";
import axios from "axios";
import { XCircle as StartOverIcon } from "lucide-react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home({ userData }) {
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [userUploadedImage, setUserUploadedImage] = useState(null);
  const [brushSize, setBrushSize] = useState(40); // Default brush size

  useEffect(() => {
    console.log("Checking User Login");
    // Check user login status on component mount
    if (userData) {
      console.log("User data:", userData);
    } else {
      console.log("No user data received");
    }
  }, [userData]);

  const handleLogout = () => {
    window.location.href = 'https://www.fulljourney.ai/api/auth/logoutnextjs';
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const promptValue = e.target.prompt.value;
  
    try {
      // Get the last successful prediction's output, if it exists
      const lastOutput = predictions.length > 0 && predictions[predictions.length - 1].status === 'succeeded'
        ? predictions[predictions.length - 1].output
        : null;
  
      // Determine the image to use: if there's a mask, use the last successful output; otherwise, use the user uploaded image
      const imageToUse = maskImage && lastOutput ? lastOutput : userUploadedImage;
  
      // If there's no image to use, don't proceed
      if (!imageToUse) {
        setError('No image to process.');
        return;
      }
  
      // If userUploadedImage is in use, convert it to Data URL
      const imageForProcessing = userUploadedImage === imageToUse
        ? await readAsDataURL(userUploadedImage)
        : imageToUse;
  
      const body = {
        prompt: promptValue,
        image: imageForProcessing,
        mask: maskImage,
      };
  
      const response = await axios.post("/api/predictions", body);
      const newPrediction = response.data;
  
      setPredictions((prevPredictions) => [...prevPredictions, newPrediction]);
  
      let statusCheck = newPrediction.status;
      while (statusCheck !== "succeeded" && statusCheck !== "failed") {
        await sleep(1000);
        const statusResponse = await axios.get(`/api/predictions/${newPrediction.id}`);
        const updatedPrediction = statusResponse.data;
        statusCheck = updatedPrediction.status;
        setPredictions((prevPredictions) => prevPredictions.map(p => p.id === updatedPrediction.id ? updatedPrediction : p));
      }
  
      // After a successful prediction, clear the mask to prepare for potential new masked areas
      if (statusCheck === "succeeded") {
        setMaskImage(null);
      }
    } catch (err) {
      setError(err.response?.data.detail || "An error occurred");
    }
  };
  

  const startOver = () => {
    setPredictions([]);
    setError(null);
    setMaskImage(null);
    setUserUploadedImage(null);
  };

  return (

    <div>
      <Head>
        <title>FullJourney.AI Inpainting</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <p className="pb-5 text-xl text-white text-center font-helvetica">
        <strong>FullJourney.AI Inpainting Greatness</strong>
      </p>
      <p className="pb-2 text-xl text-gray-500 text-center font-helvetica">
        <strong>Draw over the areas you want replaced...</strong>
      </p>
      <main className="container mx-auto p-2">
        {error && <div>{error}</div>}

        {/* Brush size slider */}
        <div className="brush-slider-container text-white flex items-center justify-center mx-auto" style={{ width: '30%' }}>
        <label htmlFor="brushSize" className="flex-shrink-0 mr-2">Brush Size: {brushSize}</label>
        <input
          type="range"
          id="brushSize"
          name="brushSize"
          min="1"
          max="100"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="brush-slider flex-grow"
        />
      </div>

        <div className="border-hairline max-w-[512px] mx-auto relative">
          <Dropzone
            onImageDropped={setUserUploadedImage}
            predictions={predictions}
            userUploadedImage={userUploadedImage}
          />
          <div
            className="bg-black relative max-h-[512px] w-full flex items-stretch  border-4 border-pink-400 rounded-xl"
            // style={{ height: 0, paddingBottom: "100%" }}
          >
            <Canvas
              brushSize={brushSize}
              predictions={predictions}
              userUploadedImage={userUploadedImage}
              onDraw={setMaskImage}
            />
          </div>
        </div>

        <div className="max-w-[512px] mx-auto">
          <PromptForm onSubmit={handleSubmit} />

          <div className="text-center">
            {((predictions.length > 0 &&
              predictions[predictions.length - 1].output) ||
              maskImage ||
              userUploadedImage) && (
              <button className="lil-button" onClick={startOver}>
                <StartOverIcon className="icon" />
                Start over
              </button>
            )}

            <Download predictions={predictions} />
          </div>
        </div>
      </main>
       {/* Add a logout button at the bottom of the page */}
       <footer className="text-center my-4">
        <button 
          onClick={handleLogout} 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </footer>
    </div>
  );
}

// Helper function to read file as data URL
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = () => {
      resolve(fr.result);
    };
    fr.readAsDataURL(file);
  });
}

// getServerSideProps remains unchanged, except removing the try-catch block for brevity
export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.headers.cookie || '';

  const response = await axios.get('https://www.fulljourney.ai/api/auth/', {
    headers: { Cookie: cookies },
    withCredentials: true,
  });

  const userData = response.data;

  return { props: { userData } };
}