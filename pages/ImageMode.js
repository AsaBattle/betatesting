import { useRef, useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Head from "next/head";
import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Dropzone from "components/dropzone";
import Download from "components/download";
import axios from "axios";
import { serialize } from 'cookie';
import { XCircle as StartOverIcon } from "lucide-react";
import styles from './ImageMode.module.css';
import MenuBar from '../components/toolbars/MenuBar';
import VerticalToolbar from '../components/toolbars/VerticalToolbar';
import ToolbarOptions from '../components/toolbars/ToolbarOptions';
import { tools, getResolution } from '../components/tools/Tools';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentTool, setBrushSize, setZoomWidth } from '../redux/slices/toolSlice';
import { pushToUndo, undo, redo, setIndex, setCurrentImage } from '../redux/slices/historySlice'; // Adjust the import path
import ImageNavigation from '../components/ImageNavigation';
import { set } from "lodash";

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
    const [isLoading, setIsLoading] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 }); // New state for canvas size
    const [loadedAspectRatio, setLoadedAspectRatio] = useState('default');
    const [currentPredictionStatus, setCurrentPredictionStatus] = useState('idle');

    // Get the current aspect ratio's width and height
    const currentAspectRatioName = useSelector((state) => state.toolbar.aspectRatioName); 
    
    // The next line exports the value of the number of images stored inside of predictions
    
    const canvasContainerRef = useRef(null);
    const canvasRef = useRef();
    const toolbarRef = useRef(null);
    const index = useSelector((state) => state.history.index - 1); // Access index from history slice

    const belowCanvasRef = useRef(null); // This ref would be attached to your below-canvas element

     
    // Calculate aspect ratio from the current prediction if available
    const currentImageAspectRatio = predictions && predictions.length > index && predictions[index]
     ? predictions[index].aspectRatioName
     : 'default'; // Default or fallback aspect ratio

    const { width, height, displayWidth } = getResolution(currentImageAspectRatio);
    const zoomWidth = useSelector((state) => state.toolbar.zoomWidth);

    const handleToolChange = (tool) => {
        dispatch(setCurrentTool(tool));
    };

    const handleBrushSizeChange = (size) => {
        dispatch(setBrushSize(size));
    };

    const handleCanvasSizeChange = (size) => {
      console.log('Received Canvas Size:', size); // Log the size received from Canvas
      setCanvasSize(size); // Callback to receive canvas size
    };      

    const updateCanvasPosition = () => {
        if (canvasContainerRef.current && toolbarRef.current) {
            const canvasRect = canvasContainerRef.current.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            toolbarRef.current.style.top = `${canvasRect.top + scrollTop + 5}px`;
            toolbarRef.current.style.left = `${canvasRect.left - 100}px`;
         // console.log('Canvas Rect:', canvasRect);
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
         // console.log("checking login - theUserData is: ", theUserData);
            if (theUserData.userData) {
                setUserData(theUserData.userData);
            }
        }
    };

  
    useEffect(() => {
      dispatch(setZoomWidth(displayWidth));
    }, [displayWidth]);


    useEffect(() => {
      if (canvasContainerRef.current && toolbarRef.current) {
        const canvasRect = canvasContainerRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        toolbarRef.current.style.top = `${canvasRect.top + scrollTop + 5}px`;
        toolbarRef.current.style.left = `${canvasRect.left - 100}px`;
     // console.log('Canvas Rect:', canvasRect);
      } 
    }, [zoomWidth]);


    // When the user uploads an image, Dropzone will call this function with
    //  the image data URL and aspect ratio name(see toolSlice) calculated from the image's dimensions
    const handleImageAsFirstPrediction = (imageDataUrl, aspectRatio) => {
      const newPrediction = {
        // Structure this object to match the prediction objects you receive from your API
        id: 'local-image', // or generate a unique ID as needed
        output: [imageDataUrl],
        status: 'succeeded', // or the appropriate status
        aspectRatioName: aspectRatio,
        // ... any other necessary properties
      };

      setPredictions([newPrediction, ...predictions]);
     // console.log("setting index to predictions.length: " + predictions.length);
      dispatch(setIndex(predictions.length+1));
    };


    function findLastPercentageNumber(inputString) {
      // Use a regular expression to find all occurrences of percentages in the string
      const percentages = inputString.match(/\b(\d+)%/g);
    
      // Check if any percentages were found
      if (percentages && percentages.length > 0) {
        // Extract the last percentage found, remove the '%' sign, and convert to integer
        const lastPercentage = parseInt(percentages[percentages.length - 1], 10);
        return lastPercentage;
      } else {
        // Return null if no percentages were found
        return null;
      }
    }

    function findLastPercentageWithGraphic(inputString) {
      // Use a regular expression to find all occurrences of percentages followed by the progress bar graphic
      const pattern = /\b(\d+)%\|[^|]*\|/g;
      const matches = [...inputString.matchAll(pattern)];
    
      // Check if any matches were found
      if (matches && matches.length > 0) {
        // Extract the match related to the last percentage and its progress bar graphic
        const lastMatch = matches[matches.length - 1][0];
        return lastMatch;
      } else {
        // Return null if no matches were found
        return null;
      }
    }

    function findLastPercentageWithFormattedGraphic2(inputString) {
      // Use a regular expression to find all occurrences of percentages followed by the progress bar graphic
      const pattern = /\b(\d+)%\|([^|]*)\|/g;
      const matches = [...inputString.matchAll(pattern)];
    
      // Check if any matches were found
      if (matches && matches.length > 0) {
        // Extract the percentage and the progress bar graphic for the last match
        const lastMatch = matches[matches.length - 1];
        let percentage = lastMatch[1]; // Capture the percentage
        const progressBarGraphic = lastMatch[2].trim(); // Capture the progress bar graphic and trim spaces
    
        // Format the output to have the percentage on the first line and the graphic on the second line
        return `${percentage}%\n${progressBarGraphic}`;
      } else {
        // Return null if no matches were found
        return null;
      }
    }

    function findLastPercentageWithAdjustedGraphic(inputString) {
      // Use a regular expression to find all occurrences of percentages followed by the progress bar graphic
      const pattern = /\b(\d+)%\|([^|]*)\|/g;
      const matches = [...inputString.matchAll(pattern)];
    
      // Check if any matches were found
      if (matches && matches.length > 0) {
        // Extract the percentage and the progress bar graphic for the last match
        let percentage = parseInt(matches[matches.length - 1][1], 10); // Capture the percentage and convert to integer
        const progressBarGraphic = matches[matches.length - 1][2].trim(); // Capture the progress bar graphic and trim spaces
    
        // Adjust the percentage if it's 100
        if (percentage === 100) 
          percentage = 99;
    
        // Format the output to have the percentage on the first line and the graphic on the second line
        return `${percentage}%\n${progressBarGraphic}`;
      } else {
        // Return null if no matches were found
        return null;
      }
    }

const handleSubmit = async (e) => {
  setIsLoading(true);
  e.preventDefault();

 // console.log("handleSubmit is using index: " + index);
  const currentPrediction = predictions[index];
  const currentPredictionOutput = currentPrediction?.output ? currentPrediction.output[currentPrediction.output.length - 1] : null;

  const { width, height } = getResolution(currentAspectRatioName); // Use the getResolution function with the current aspect ratio
  //console.log("Calling image generate with width: " + width + " and height: " + height);
  const body = {
    prompt: e.target.prompt.value,
    image: maskImage ? currentPredictionOutput : null,
    mask: maskImage,
    width,  // Include width
    height, // Include height
    aspectRatioName: currentAspectRatioName, // Include the aspect ratio name if needed by your backend
  };

  const response = await fetch("/api/predictions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const prediction = await response.json();

  if (response.status !== 201) {
    console.log("status is: ", response.status," and thecode is: ", prediction.thecode);
    // Redirect the user to the /Subscribe page if 5001 is returned
    if (prediction.thecode === 5001)
      {
        router.push('/Subscribe');
        return;
      }
    
    setError(prediction.detail);
    setIsLoading(false);
    return;
  }

  //console.log("prediction is: ", prediction.theuser)

  // Modify the prediction object to include the aspect ratio name before adding it to the state
  const newPrediction = {
    ...prediction,
    aspectRatioName: currentAspectRatioName,
  };

  // Add the new prediction to the predictions state
  setPredictions(predictions.concat([newPrediction]));

  // Set the history index to the last element of the predictions array, which will be the new prediction
  dispatch(setIndex(predictions.length));
  setCurrentPredictionStatus("Server warming up...");
  while (prediction.status !== "succeeded" && prediction.status !== "failed") {
    await sleep(1000);
    const response = await fetch("/api/predictions/" + prediction.id);
    const updatedPrediction = await response.json();
    if (response.status !== 200) {
      setError(updatedPrediction.detail);
      setIsLoading(false);
      console.log("Prediction error detail is: ", updatedPrediction.detail)
      console.log("prediction2 is: ", prediction.theuser)
      return;
    }
    //console.log("Response status is: ", response.status," ", updatedPrediction.status);
    //console.log("Updated Prediction Logs: ", updatedPrediction.logs);
    //console.log("IS: ", findLastPercentageWithAdjustedGraphic(updatedPrediction.logs));
    const lastPercentage = findLastPercentageWithAdjustedGraphic(updatedPrediction.logs)
    setCurrentPredictionStatus(lastPercentage? lastPercentage : "Server warming up...");


    if (updatedPrediction.status === "succeeded") {
      setPredictions(currentPredictions => {
        const updatedPredictions = [...currentPredictions];
        const indexToUpdate = updatedPredictions.findIndex(p => p.id === updatedPrediction.id);
        if (indexToUpdate !== -1) {
          updatedPredictions[indexToUpdate] = {
            ...updatedPrediction,
            aspectRatioName: currentAspectRatioName, // Ensure the updated prediction also includes the aspect ratio
          };
        }
        dispatch(setIndex(updatedPredictions.length));
        setIsLoading(false);
       // console.log("prediction3 is: ", prediction.theuser)
       console.log("updatedPrediction is: ", updatedPrediction.logs);
        return updatedPredictions;
      });
      break;
    } else if (updatedPrediction.status === "failed") {
      setError("The Prediction failed");
      setIsLoading(false);  
     // console.log("prediction4 is: ", prediction.theuser)
      break;
    }
  }
};


//useEffect(() => {
//  console.log('predictions: ', predictions);
//}, [predictions]);

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


    return (
      <div className={styles.layout}>
          <div className={`${styles.toolbar} ${styles.verticalToolbar}`} ref={toolbarRef}>
              <VerticalToolbar currentTool={currentTool} onToolChange={handleToolChange} onToolSelected={onToolSelected} />
          </div>
          <div className={styles.content}>
              <Head>
                  <title>FullJourney.AI Studio Beta 1.08a</title>
                  <meta name="viewport" content="initial-scale=1.0, width=device-width" />
              </Head>
              <p className="pb-5 text-xl text-white text-center font-helvetica">
                  <strong>FullJourney.AI Studio</strong>
              </p>
              {/*<p className="pb-2 text-xl text-gray-500 text-center font-helvetica">
                  <strong>Draw over the areas you want replaced...</strong>
                </p>*/}
              <main className="container mx-auto p-2">
                  {error && <div>{error}</div>}
                  <ToolbarOptions predictions={predictions} canvasRef={canvasRef}/>
                  {/*<div className={`border-hairline mx-auto relative`} style={{ width: `${zoomWidth < displayWidth ? displayWidth : zoomWidth}px` }} ref={canvasContainerRef}>*/}
                  <div className={`border-hairline mx-auto relative`} style={{ width: `${zoomWidth < displayWidth ? displayWidth : zoomWidth}px` }} ref={canvasContainerRef}>
                      <Dropzone onImageAsFirstPrediction={handleImageAsFirstPrediction} predictions={predictions} />
                      <div className={`bg-black relative max-h-full mx-auto flex items-stretch border-4 border-pink-400 rounded-xl ${styles.responsiveCanvasContainer}`}  style={{ width: `${zoomWidth}px` }}>
                          <Canvas
                              ref={canvasRef}
                              isLoading={isLoading}
                              brushSize={brushSize}
                              predictions={predictions}
                              userUploadedImage={userUploadedImage}
                              onDraw={setMaskImage}
                              currentTool={currentTool}
                              onCanvasSizeChange={handleCanvasSizeChange}
                              currentPredictionStatus={currentPredictionStatus}
                          />
                      </div>
                  </div>
                  <div id="asathisisit"  ref={belowCanvasRef} className={`max-w-[512px] mx-auto`}>
                      <ImageNavigation imageTotal={predictions.length} />
                      <PromptForm onSubmit={handleSubmit} predictions={predictions} />
                      <div className="text-center">
                          {undoStack.length > 0 && (
                              <button className="lil-button" onClick={PerformUndo}>
                                  <StartOverIcon className="icon" />
                                  Undo
                              </button>
                          )}
                          {((predictions.length > 0 && predictions[predictions.length - 1].output) || maskImage || userUploadedImage) && (
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
  const { req, res } = context;
  const cookies = req.headers.cookie || '';
  
  if (process.env.NEXT_PUBLIC_WORKING_LOCALLY === 'false') {
    console.log("false Inside getServerSideProps in index.js NEXT_PUBLIC_WORKING_LOCALLY is: " + process.env.NEXT_PUBLIC_WORKING_LOCALLY);
    console.log("Sending request for the users login data to the server...")
    try {
      const response = await axios.get('https://www.fulljourney.ai/api/auth/', {
        headers: { Cookie: cookies },
        withCredentials: true,
      });

      console.log("response.data is: ", response.data);
      const userData = response.data;

      // Serialize the user data into a cookie string
      const userDataCookie = serialize('user', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookie in production
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        path: '/',
      });

      // Set the cookie in the response header
      res.setHeader('Set-Cookie', userDataCookie);

      /*
      // check if the user has a subscription
      if (userData.subscription_status === 'free') {
        console.log("User is not subscribed");
        return {
          redirect: {
            destination: '/Subscribe',
            permanent: false,
          },
        };
      }*/

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
  } else {
    console.log("true Inside getServerSideProps in index.js NEXT_PUBLIC_WORKING_LOCALLY is: " + process.env.NEXT_PUBLIC_WORKING_LOCALLY);

    return {
      props: {
        isAuthenticated: true,
      },
    };
  }
}