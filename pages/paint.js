import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Head from "next/head";
import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Dropzone from "components/dropzone";
import Download from "components/download";
import axios from "axios";
import { XCircle as StartOverIcon } from "lucide-react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home(theUserData) {
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [userUploadedImage, setUserUploadedImage] = useState(null);
  const [brushSize, setBrushSize] = useState(40); // Default brush size
  const [userData, setUserData] = useState(null);

  const router = useRouter();

  // Add a logout function
  const handleLogout = () => {
    window.location.href = 'https://www.fulljourney.ai/api/auth/logoutnextjs';
  };

  useEffect(() => {
    checkUserLogin();
  }, []);

  const checkUserLogin = async () => {
    if (theUserData) {
      console.log("theUserData is: ", theUserData);
      if (theUserData.userData) {
        console.log("theUserData.userData is: ", theUserData.userData);
        setUserData(theUserData.userData);
      } else {
        console.log("theUserData.userData is null");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const prevPrediction = predictions[predictions.length - 1];
    const prevPredictionOutput = prevPrediction?.output
      ? prevPrediction.output[prevPrediction.output.length - 1]
      : null;
  
    const body = {
      prompt: e.target.prompt.value,
      image: userUploadedImage
        ? await readAsDataURL(userUploadedImage)
        : maskImage ? prevPredictionOutput : null,
      mask: maskImage,
    };
  
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    const prediction = await response.json();
  
    if (response.status !== 201) {
      setError(prediction.detail);
      console.error("Error in prediction response: ", prediction.detail); // Added logging for error detail
      return;
    }
  
    setPredictions(predictions.concat([prediction]));
  
    // Added Debugging Logs
    console.log("Initial prediction status:", prediction.status);
  
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      const updatedPrediction = await response.json();
      if (response.status !== 200) {
        setError(updatedPrediction.detail);
        console.error("Error in updating prediction: ", updatedPrediction.detail); // Added logging for error detail
        return;
      }
  
      // Debugging logs
      console.log("Updated prediction status:", updatedPrediction.status);
  
      if (updatedPrediction.status === "succeeded") {
        setPredictions(currentPredictions => {
          // Ensure the last prediction is updated with the final output
          const updatedPredictions = [...currentPredictions];
          const indexToUpdate = updatedPredictions.findIndex(p => p.id === updatedPrediction.id);
          if (indexToUpdate !== -1) {
            updatedPredictions[indexToUpdate] = updatedPrediction;
          }
          return updatedPredictions;
        });
  
        setUserUploadedImage(null); // Clear the uploaded image since the prediction succeeded
        break; // Exit the loop since the prediction has succeeded
      } else if (updatedPrediction.status === "failed") {
        setError("Prediction failed"); // Handle the failed prediction case
        break; // Exit the loop since the prediction has failed
      } else {
        // Update predictions state to trigger re-render with new status
        setPredictions(currentPredictions => {
          const updatedPredictions = [...currentPredictions];
          const indexToUpdate = updatedPredictions.findIndex(p => p.id === updatedPrediction.id);
          if (indexToUpdate !== -1) {
            updatedPredictions[indexToUpdate] = updatedPrediction;
          }
          return updatedPredictions;
        });
      }
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
      <footer className="text-center my-4">
        <button 
          onClick={handleLogout} 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logouta
        </button>
      </footer>
    </div>
  );
}

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

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.headers.cookie || '';

  try {
    const response = await axios.get('https://www.fulljourney.ai/api/auth/', {
      headers: { Cookie: cookies },
      withCredentials: true,
    });

    const userData = response.data;
    return { props: { userData } };
  } catch (error) {
    console.error('Error:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
