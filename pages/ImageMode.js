import { useRef, useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Head from "next/head";
import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Dropzone from "components/dropzone";
import Download from "components/download";
import axios from "axios";
import { XCircle as StartOverIcon } from "lucide-react";

import Menu from '../components/menu';
//import Toolbar from '../components/Toolbar';
import styles from './ImageMode.module.css';

import VerticalToolbar from '../components/VerticalToolbar';
import ToolbarOptions from '../components/ToolbarOptions';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


export default function Home(theUserData) {
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [userUploadedImage, setUserUploadedImage] = useState(null);
  const [brushSize, setBrushSize] = useState(40);
  const [currentTool, setCurrentTool] = useState('maskPainting');
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const placeholderHandler = () => console.log('Handler not implemented yet.');

  
  const canvasContainerRef = useRef(null);
  const toolbarRef = useRef(null);




 // Define the function to update the canvas position
const updateCanvasPosition = () => {
  if (canvasContainerRef.current && toolbarRef.current) {
    const canvasRect = canvasContainerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    // Adjust the 'top' by adding the current scroll position to the canvas's client rect top.
    // Since your toolbar is fixed, this will align it with the canvas accounting for scroll.
    toolbarRef.current.style.top = `${canvasRect.top + scrollTop}px`;
    toolbarRef.current.style.left = `${canvasRect.left - 155}px`;
    console.log(`Canvas X: ${canvasRect.left}, Canvas Y: ${canvasRect.top}`);
  }
};
  // Set up the event listener for window resize, so we can position the toolbars correctly
  useEffect(() => {
    const handleScroll = () => {
      updateCanvasPosition();
    };

    updateCanvasPosition();
    window.addEventListener('resize', updateCanvasPosition);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', updateCanvasPosition);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  // Add a logout function
  const handleLogout = () => {
    window.location.href = 'https://www.fulljourney.ai/api/auth/logoutnextjs';
  };

  useEffect(() => {
    checkUserLogin();
  }, []);

  const checkUserLogin = async () => {
    console.log("Working locally: " + process.env.NEXT_PUBLIC_WORKING_LOCALLY);


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
      image: userUploadedImage || (maskImage ? prevPredictionOutput : null),
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
    <div className={styles.layout}>
       <div className={`${styles.toolbar} ${styles.verticalToolbar}`} ref={toolbarRef}>
       <VerticalToolbar currentTool={currentTool} setCurrentTool={setCurrentTool} />
      </div>
      <div className={styles.content}>
        <Head>
          <title>FullJourney.AI Inpainting</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <Menu
          onModeChange={placeholderHandler}
          onProfileClick={placeholderHandler}
          onSave={placeholderHandler}
          onLoad={placeholderHandler}
          onUndo={placeholderHandler}
          onRedo={placeholderHandler}
        />
        <p className="pb-5 text-xl text-white text-center font-helvetica">
          <strong>FullJourney.AI Inpainting Greatness</strong>
        </p>
        <p className="pb-2 text-xl text-gray-500 text-center font-helvetica">
          <strong>Draw over the areas you want replaced...</strong>
        </p>
        <main className="container mx-auto p-2">
          {error && <div>{error}</div>}
          <ToolbarOptions currentTool={currentTool} brushSize={brushSize} setBrushSize={setBrushSize} />
          <div className="border-hairline max-w-[512px] mx-auto relative" ref={canvasContainerRef}>
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
            Logout
          </button>
          </footer>
      </div>
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


  if (process.env.NEXT_PUBLIC_WORKING_LOCALLY === 'false')
    {
      console.log("false Inside getServerSideProps in index.js NEXT_PUBLIC_WORKING_LOCALLY is: " + process.env.NEXT_PUBLIC_WORKING_LOCALLY);
      console.log("checking for user data")
     try {
        const response = await axios.get('https://www.fulljourney.ai/api/auth/', {
          headers: { Cookie: cookies },
          withCredentials: true,
        });

        console.log("response.data is: ", response.data);
        const userData = response.data;
        return { props: { userData } };
      } catch (error) {
        console.error('No user data!!! Error:', error);
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }
    }
  else
    {
      console.log("true Inside getServerSideProps in index.js NEXT_PUBLIC_WORKING_LOCALLY is: " + process.env.NEXT_PUBLIC_WORKING_LOCALLY);

      return {
        props: {
          isAuthenticated: true,
        },
      };
    }
}
