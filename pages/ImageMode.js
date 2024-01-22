import { useRef, useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Head from "next/head";
import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Dropzone from "components/dropzone";
import Download from "components/download";
import axios from "axios";
import { XCircle as StartOverIcon } from "lucide-react";
import styles from './ImageMode.module.css';
import MenuBar from '../components/toolbars/MenuBar';
import VerticalToolbar from '../components/toolbars/VerticalToolbar';
import ToolbarOptions from '../components/toolbars/ToolbarOptions';
import { tools } from '../components/tools/Tools';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentTool, setBrushSize } from '../redux/slices/toolSlice';
import { pushToUndo, undo, redo, setIndex, setCurrentImage } from '../redux/slices/historySlice'; // Adjust the import path
import ImageNavigation from '../components/ImageNavigation';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home(theUserData) { 
    const [predictions, setPredictions] = useState([]);
    const [error, setError] = useState(null);
    const [maskImage, setMaskImage] = useState(null);
    const [userUploadedImage, setUserUploadedImage] = useState(null);
    const currentToolName = useSelector((state) => state.toolbar.currentToolName);
    const brushSize = useSelector((state) => state.toolbar.brushSize);
    const dispatch = useDispatch();
    const currentImage = useSelector((state) => state.history.currentImage);
    const [userData, setUserData] = useState(null);
    const router = useRouter();
    const placeholderHandler = () => console.log('Handler not implemented yet.');
    const undoStack = useSelector((state) => state.history.undoStack);

    // The next line exports the value of the number of images stored inside of predictions
    
    const canvasContainerRef = useRef(null);
    const toolbarRef = useRef(null);
    const index = useSelector((state) => state.history.index); // Access index from history slice

    // just put the above index in, but it's not changing in the display below

    const handleToolChange = (tool) => {
        dispatch(setCurrentTool(tool));
    };

    const handleBrushSizeChange = (size) => {
        dispatch(setBrushSize(size));
    };

      

    const updateCanvasPosition = () => {
        if (canvasContainerRef.current && toolbarRef.current) {
            const canvasRect = canvasContainerRef.current.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            toolbarRef.current.style.top = `${canvasRect.top + scrollTop}px`;
            toolbarRef.current.style.left = `${canvasRect.left - 100}px`;
        }
    };

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

    const handleLogout = () => {
        window.location.href = 'https://www.fulljourney.ai/api/auth/logoutnextjs';
    };

    useEffect(() => {
        checkUserLogin();
    }, []);

    const checkUserLogin = async () => {
        if (theUserData) {
            if (theUserData.userData) {
                setUserData(theUserData.userData);
            }
        }
    };

    const handleImageAsFirstPrediction = (imageDataUrl) => {
      const newPrediction = {
        // Structure this object to match the prediction objects you receive from your API
        id: 'local-image', // or generate a unique ID as needed
        output: [imageDataUrl],
        status: 'succeeded', // or the appropriate status
        // ... any other necessary properties
      };
      
      setPredictions([newPrediction, ...predictions]);
      console.log("setting index to predictions.length: " + predictions.length);
      dispatch(setIndex(predictions.length+1));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const prevPrediction = predictions[predictions.length - 1];
      const prevPredictionOutput = prevPrediction?.output ? prevPrediction.output[prevPrediction.output.length - 1] : null;
      const body = {
          prompt: e.target.prompt.value,
          image: maskImage ? prevPredictionOutput : null,
          mask: maskImage,
      };
    
      const response = await fetch("/api/predictions", {
          method: "POST",
          headers: { "Content-Type": "application/json", },
          body: JSON.stringify(body),
      });
    
      const prediction = await response.json();
    
      if (response.status !== 201) {
          setError(prediction.detail);
          return;
      }
    
      // Add the new prediction to the predictions state
      setPredictions(predictions.concat([prediction]));
      // Set the history index to the last element of the predictions array, which will be the new prediction
      dispatch(setIndex(predictions.length+1));
    
      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
          await sleep(1000);
          const response = await fetch("/api/predictions/" + prediction.id);
          const updatedPrediction = await response.json();
          if (response.status !== 200) {
              setError(updatedPrediction.detail);
              return;
          }
    
          if (updatedPrediction.status === "succeeded") {
              setPredictions(currentPredictions => {
                  const updatedPredictions = [...currentPredictions];
                  const indexToUpdate = updatedPredictions.findIndex(p => p.id === updatedPrediction.id);
                  if (indexToUpdate !== -1) {
                      updatedPredictions[indexToUpdate] = updatedPrediction;
                  }
                  // Update the history index here as well, after the prediction has been updated
                  dispatch(setIndex(updatedPredictions.length));
                  return updatedPredictions;
              });
              break;
          } else if (updatedPrediction.status === "failed") {
              setError("Prediction failed");
              break;
          }
      }
    };

    const startOver = () => {
        setPredictions([]);
        setError(null);
        setMaskImage(null);
        setUserUploadedImage(null);
    };

    // Find the full tool object using the current tool's name
    const currentTool = tools.find(tool => tool.name === currentToolName);


    const onToolSelected = (tool) => {
      switch (tool.name) {
          case 'MaskPainter':
              // Logic for MaskPainter tool
              break;
          case 'Zoom':
              // Logic for Zoom tool
              break;
          // Add cases for other tools
          default:
              break;
      }
  };



  const PerformUndo = () => {
    dispatch(undo());
    // Apply the image from the undo stack to the canvas
    // This might involve updating the state or props that determine the canvas image
    setUserUploadedImage(currentImage);
  };

  const PerformRedo = () => {
    dispatch(redo());
    // Apply the image from the redo stack to the canvas
    // Similar to undo, but using the next image
  };

  // Function to handle new image (from Dropzone or after generation)
  const handleNewImage = (newImage) => {
    dispatch(setCurrentImage(newImage));
    // Additional logic to display the new image on the canvas
  };


  return (
    <div className={styles.layout}>
       <div className={`${styles.toolbar} ${styles.verticalToolbar}`} ref={toolbarRef}>
       <VerticalToolbar currentTool={currentTool} onToolChange={handleToolChange} onToolSelected={onToolSelected} />
      </div>
      <div className={styles.content}>
        <Head>
          <title>FullJourney.AI Inpainting</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <p className="pb-5 text-xl text-white text-center font-helvetica">
          <strong>FullJourney.AI Inpainting Greatness</strong>
        </p>
        <p className="pb-2 text-xl text-gray-500 text-center font-helvetica">
          <strong>Draw over the areas you want replaced...{predictions.length}{index}</strong>
        </p>
        {/*<MenuBar/>*/}
        <main className="container mx-auto p-2">
          {error && <div>{error}</div>}
          <ToolbarOptions currentTool={currentTool} brushSize={brushSize} onBrushSizeChange={handleBrushSizeChange} />
          <div className="border-hairline max-w-[512px] mx-auto relative" ref={canvasContainerRef}>
          <Dropzone
            onImageAsFirstPrediction={handleImageAsFirstPrediction}
            predictions={predictions}
          />
            <div
              className="bg-black relative max-h-[512px] w-full flex items-stretch  border-4 border-pink-400 rounded-xl"
            >
              <Canvas
                brushSize={brushSize}
                predictions={predictions}
                userUploadedImage={userUploadedImage}
                onDraw={setMaskImage}
                currentTool={currentTool} // Pass the current tool as a prop
              />
            </div>
          </div>
          <div className="max-w-[512px] mx-auto">
          <ImageNavigation imageTotal = {predictions.length}/>

          <PromptForm onSubmit={handleSubmit} />
          <div className="text-center">
            {undoStack.length > 0 && ( // Only show the Undo button if there are items in the undo stack
              <button className="lil-button" onClick={PerformUndo}>
                <StartOverIcon className="icon" />
                Undo
              </button>
            )}
            {((predictions.length > 0 &&
              predictions[predictions.length - 1].output) ||
              maskImage ||
              userUploadedImage) && (
              <button className="lil-button" onClick={startOver}>
                <StartOverIcon className="icon" />
                Start over1
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
