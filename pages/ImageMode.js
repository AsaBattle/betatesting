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
import VerticalToolbar from '../components/toolbars/VerticalToolbar';
import ErrorModal from '../components/errorModal';
import ToolbarOptions from '../components/toolbars/ToolbarOptions';
import { tools, getResolution } from '../components/tools/Tools';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentTool, setBrushSize, setZoomWidth, setUserIsLoggedInWithAccount } from '../redux/slices/toolSlice';
import { undo, redo, setIndex} from '../redux/slices/historySlice'; // Adjust the import path
import ImageNavigation from '../components/ImageNavigation';
import { getSession, signOut } from "next-auth/react";
import AuthService from '../services/authService';

import { v4 as uuidv4 } from 'uuid';
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
    const [theupdatedPrediction, settheUpdatedPrediction] = useState(null);


    // Get the current aspect ratio's width and height
    const currentAspectRatioName = useSelector((state) => state.toolbar.aspectRatioName); 
    const hamburgerVisible = useSelector((state) => state.toolbar.hamburgerVisible);
    const hamXOffset = (hamburgerVisible ? -20 : 100);
    const hamYOffset = (hamburgerVisible ? -105 : 5);

    const canvasContainerRef = useRef(null);
    const toolbaroptionsRef = useRef(null);
    const canvasRef = useRef();
    const toolbarRef = useRef(null);
    const index = useSelector((state) => state.history.index - 1); // Access index from history slice

    const belowCanvasRef = useRef(null); // This ref would be attached to your below-canvas element
    const updatedPrediction = null;

    const [generateClicked, setGenerateClicked] = useState(false); // Keep track of the generate button click, so that canvas knows when to reset it mask data
     
    // Calculate aspect ratio from the current prediction if available
    const currentImageAspectRatio = predictions && predictions.length > index && predictions[index]
     ? predictions[index].aspectRatioName
     : 'default'; // Default or fallback aspect ratio

    const { width, height, displayWidth } = getResolution(currentImageAspectRatio);
    const zoomWidth = useSelector((state) => state.toolbar.zoomWidth);

    const [clearMask, setClearMask] = useState(false);
    const [userLoginNameAndCredits, setUserLoginNameAndCredits] = useState('');


    function checkUserLoginAndCreditsForChange() {
      console.log("checkUserLoginAndCreditsForChange is being called");
      if (theUserData.userData) {
        console.log("OK theUserData that is available is this:", theUserData);
        /*
        console.log("theUserData is available:", theUserData.userData.discordname, " Credits: ", theUserData.userData.credits);
        if (parseInt(theUserData.userData.credits) > 100)
          setUserLoginNameAndCredits(`Username: ${theUserData.userData.discordname}`);
        else
         setUserLoginNameAndCredits(`Username: ${theUserData.userData.discordname} Credits: ${theUserData.userData.credits}`);
        */
      } else {
        console.log("theUserData is not available");
        const userId = localStorage.getItem('userId');
        const imageTokens = localStorage.getItem('imageTokens');
        setUserLoginNameAndCredits(`FREE Credits Remaining: ${imageTokens}`);
      }
    }
    

    

    useEffect(() => {
      console.log("theUserData changed or component just mounted - theUserData is: ", theUserData);
      checkUserLoginAndCreditsForChange();
    }, [theUserData]);



    // Function to clear the mask
    const clearMaskImage = () => {
      setMaskImage(null); // or setMaskImage('');
      setClearMask(true); // Set clearMask to true when clearing the mask
    };
    
    // Reset clearMask to false after it's been set to true
    useEffect(() => {
      if (clearMask) {
        setClearMask(false);
      }
    }, [clearMask]);



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
        // If the hamburger is visible, position the hambuger icon/toolbar on the toolbaroptions menu

          console.log("1hamburgerVisible is: " + hamburgerVisible);
       
          if (canvasContainerRef.current && toolbarRef.current) {
            const canvasRect = canvasContainerRef.current.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            toolbarRef.current.style.top = `${canvasRect.top + scrollTop + hamYOffset}px`;
            toolbarRef.current.style.left = `${canvasRect.left - hamXOffset}px`;
          }

        //localStorage.setItem('imageTokens', 3);
    };
    

    // We keep track of each user with a unique identifier, stored in a cookie and local storage
    useEffect(() => {
      // Check if the user identifier exists in cookie
      const userIdCookie = document.cookie.replace(/(?:(?:^|.*;\s*)userId\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      
      if (!userIdCookie) {
        // Generate a unique user identifier
        const userId = uuidv4();

        console.log("User did not yet have a userId, so we are setting it to: ", userId);

        // Store the user identifier in a cookie
        document.cookie = `userId=${userId}; path=/`;
        
        // You can also store it in local storage if needed
        localStorage.setItem('userId', userId);
        localStorage.setItem('imageTokens', 3);
      } else {
        console.log("User already had a userId: ", userIdCookie);

        // check if the user has an imageTokens value in local storage
        let currentCredits = localStorage.getItem('imageTokens');
        if (!currentCredits) {
          console.log("User did not yet have an imageTokens value, so we are setting it to 3");
          localStorage.setItem('imageTokens', 3);
        } else {
          console.log("User already had an imageTokens value: ", currentCredits);
        }
      }
    }, []);


    useEffect(() => {
      console.log("is loading is: ", isLoading);
    }, [isLoading]);

  
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
    }, [hamburgerVisible]);



    const FSAMTest = async () => {
      console.log("FSAMTest is being called");
      setCurrentPredictionStatus( "Server warming up...");

      // The following code makes a call to our fsam api at /api/fsam
      if (theupdatedPrediction === null)
        {
          console.log("updatedPrediction is null");
          return;
        }


      const image_url = theupdatedPrediction.output[0];
      const prediction = null;
      setIsLoading(true);

      console.log("image_url is: ", image_url);
      try {
        const fsamRequestBody = {
          iou: 0.9,
          conf: 0.4,
          retina: true,
          box_prompt: "[0,0,0,0]",
          image_size: 640,
          model_name: "FastSAM-x",
          input_image: image_url,
          point_label: "[0]",
          point_prompt: "[[0,0]]",
          withContours: false,
          better_quality: true
        };

        const initialResponse = await axios.post('/api/fsam', fsamRequestBody, {
          headers: { 'Content-Type': 'application/json' },
        });

        prediction = initialResponse.data;
        if (initialResponse.status !== 200) {
          console.error(prediction.message || 'Something went wrong during the initial API call.');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error in handleSubmission:', error);
      }
      console.log("Initial prediction returned is: ", prediction);


      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
        await sleep(1000);
        const response = await fetch("/api/fsam/" + prediction.id);
        const updatedPrediction = await response.json();
    
        if (response.status !== 200) {
          setError({ message: updatedPrediction.detail });
          setIsLoading(false);
          console.log("Prediction error detail is: ", updatedPrediction.detail);
          return;
        }
    
        const lastPercentage = findLastPercentageWithAdjustedGraphic(updatedPrediction.logs);
        setCurrentPredictionStatus(lastPercentage ? lastPercentage : "Server warming up...");
    
      
        if (updatedPrediction.status === "succeeded") {
          console.log("Success with mask image: ", updatedPrediction.output);

          let updatedPredictions;
          let indexToUpdate;
          setPredictions(currentPredictions => {
            updatedPredictions = [...currentPredictions];
            indexToUpdate = updatedPredictions.findIndex(p => p.id === theupdatedPrediction.id);
            if (indexToUpdate !== -1) {
              updatedPredictions[indexToUpdate] = {
                ...updatedPredictions[indexToUpdate],
                magicWandMask: updatedPrediction.output,
              };
            }
            return updatedPredictions;
          });
          setIsLoading(false); 
          
          console.log("updatedPredictions: " + updatedPredictions);
          console.log("updatedPrediction: " + updatedPrediction.id);



          // Call a function to handle the successful prediction
          //thettheUpdatedPrediction(updatedPrediction);
          console.log("done with magic wand mask processing! index: ", indexToUpdate);
          break;
        } else if (updatedPrediction.status === "failed") {
          setError({ message: "The Prediction failed" });
          setIsLoading(false);  
          break;
        }
      }
    };


    const handleLogout = async () => {

      console.log("Logging out the user...");

      // Clear the user data cookie by setting an expired cookie
      const expiredUserDataCookie = serialize('user', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0), // Set the expiration date to the past
        path: '/',
      });
    
      // Set the expired cookie in the document
      document.cookie = expiredUserDataCookie;

      signOut();
      console.log("finished");
      window.location.href = 'https://www.fulljourney.ai/api/auth/logoutnextjs';
    };

    // See if the user is logged in, if 
    useEffect(() => {
        checkUserLogin();
    }, []);


     //Just got "oging check requted in setUserIsLoggedInWithAccount to false!!" message an all working-
     //now we gotta track the number of images produced
     const checkUserLogin = async () => {

        if (!theUserData) {
          console.log("Loging check requted in setUserIsLoggedInWithAccount to false!!!");
          dispatch(setUserIsLoggedInWithAccount(false));
        } else {

         // console.log("checking login - theUserData is: ", theUserData);
            if (theUserData.userData) {
          console.log("Loging check requted in setUserIsLoggedInWithAccount to  true :)");
                
                dispatch(setUserIsLoggedInWithAccount(true));
                setUserData(theUserData.userData);
            } else {
             console.log("Loging check requted in setUserIsLoggedInWithAccount to false!!!");

                dispatch(setUserIsLoggedInWithAccount(false));
            }
        }
    };

  
    useEffect(() => {
      dispatch(setZoomWidth(displayWidth));
    }, [displayWidth]);


    // Position the toolbar based on the viewport and canvas container
    useEffect(() => {
      console.log("2hamburgerVisible is: " + hamburgerVisible);
      
          if (canvasContainerRef.current && toolbarRef.current) {
            const canvasRect = canvasContainerRef.current.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            toolbarRef.current.style.top = `${canvasRect.top + scrollTop + hamYOffset}px`;
            toolbarRef.current.style.left = `${canvasRect.left - hamXOffset}px`;
          }
    }, [zoomWidth, hamburgerVisible]);


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

      settheUpdatedPrediction(newPrediction);
    };


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

    // Function to subtract credits from the user's account and check if they have enough credits
    // uses local storage to store the user's credits in imageTokens var
    const SubtractAndCheckLocalUserCredits = (userId, creditsToSubtract) => {
      let currentCredits = localStorage.getItem('imageTokens');
      currentCredits = parseInt(currentCredits);
      let newCredits = currentCredits - creditsToSubtract;

      localStorage.setItem('imageTokens', newCredits);
      checkUserLoginAndCreditsForChange();

      // less than zero because we just got to 0 after subtracting, so we count 0 as an image
      if (newCredits < 0)
        {
          console.log("(newCredits < 0");
          newCredits = 0;
          localStorage.setItem('imageTokens', newCredits);
          return false;
        }
      else
        {
          console.log("(newCredits >= 0");
          return true;
        }
    
    };


const handleSubmit = async (e) => {
  setIsLoading(true);
  e.preventDefault();

  const combinedMask = await canvasRef.current.getCombinedMask();
  const currentPrediction = predictions[index];
  const currentPredictionOutput = currentPrediction?.output ? currentPrediction.output[currentPrediction.output.length - 1] : null;
  const { width, height } = getResolution(currentAspectRatioName); // Use the getResolution function with the current aspect ratio
 
  let theLocalUserId = document.cookie.replace(/(?:(?:^|.*;\s*)userId\s*\=\s*([^;]*).*$)|^.*$/, "$1");

  console.log("Here we are about to check theUserData: ", theUserData);

  // If the user is not logged in, then see if they have any free image gens left 
  if (!theUserData.userData)
    {
      console.log("User is not logged in, so we need to check if they have any free image gens left");
     
      if (SubtractAndCheckLocalUserCredits(theLocalUserId,1) === false) {
        console.log("Local User DOES NOT have Enough Credits");
        
        // pop up a message window to tell the use to make an account
        //setError({ message: "Please make a FREE account to generate more images.", route: '/login' });
        setIsLoading(false);
        
        router.push({
          pathname: '/login',
          query: { message: "Please make a FREE account to generate more images." }
        });

        return;
      } else {
        console.log("Local User DOES HAVE enough credits, proceeding with image generation...");
      }
    } else {
      console.log("User is logged in, so we're good here");
    }

  console.log("ok, we checked it!");

  const body = {
    prompt: e.target.prompt.value,
    image: combinedMask ? currentPredictionOutput : null,
    mask: combinedMask,
    width,  // Include width
    height, // Include height
    aspectRatioName: currentAspectRatioName,
    userId: theLocalUserId,
  };

  setCurrentPredictionStatus("Server warming up...");
  const response = await fetch("/api/predictions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const prediction = await response.json();
  prediction.fsamGenerationCounter = 0;
  if (response.status !== 201) {
    console.log("status is: ", response.status, " and the code is: ", prediction.thecode);
    if (prediction.thecode === 5001) {
      
      // The user doesn't exist, so we need to do our image count processing
      if (response.status === 404) {
        console.log("User doesn't exist, but we've already done the local user image count processing");
        /*
        if (SubtractAndCheckLocalUserCredits(theLocalUserId,1) === false) {
          console.log("Local User DOES NOT have Enough Credits");
          setError(prediction.detail);
          setIsLoading(false);
          router.push('/Subscribe');
          return;
        } else { 
          console.log("Local User DOES HAVE enough credits, proceeding with image generation");
        } */
      } 
      // User exists but not enough credits
      else if (response.status === 403) {
        console.log("User exists but not enough credits");
        setError({ message: prediction.detail });
        setIsLoading(false);
        router.push('/Subscribe');
        return;
      }
    }      
  }

  setPredictions(predictions.concat([prediction]));
  dispatch(setIndex(predictions.length));

  while (prediction.status !== "succeeded" && prediction.status !== "failed") {
    await sleep(1000);
    const response = await fetch(`/api/predictions/${prediction.id}`);
    const updatedPrediction = await response.json();

    if (response.status !== 200) {
      setError({ message: updatedPrediction.detail });
      setIsLoading(false);
      console.log("Prediction error detail is: ", updatedPrediction.detail);
      return;
    }

    const lastPercentage = findLastPercentageWithAdjustedGraphic(updatedPrediction.logs);
    setCurrentPredictionStatus(lastPercentage ? lastPercentage : "Server warming up...");

    
    if (updatedPrediction.status === "succeeded") {
      setPredictions(currentPredictions => {
        const updatedPredictions = [...currentPredictions];
        const indexToUpdate = updatedPredictions.findIndex(p => p.id === updatedPrediction.id);
        if (indexToUpdate !== -1) {
          updatedPredictions[indexToUpdate] = {
            ...updatedPrediction,
            aspectRatioName: currentAspectRatioName,
          };
        }
        return updatedPredictions;
      });


      dispatch(setIndex(predictions.length+1)); // we add one to the index because we are adding a new prediction,
                                                // but dispatch isn't yet aware of the new prediction, so it's 
                                                // length is one less than the actual length
      setIsLoading(false);


      // Call a function to handle the successful prediction
      settheUpdatedPrediction(updatedPrediction);

      // clear the mask
      clearMaskImage();
      setGenerateClicked(true); 

      break;
    } else if (updatedPrediction.status === "failed") {
      setError({message:"The Prediction failed"});
      setIsLoading(false);  
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

  useEffect(() => {
    if (canvasRef.current) {
      const imageElement = canvasRef.current.firstChild;
      if (imageElement) {
        const rect = imageElement.getBoundingClientRect();
        console.log('THE----- Display width:', rect.width);
        console.log('THE----- Display height:', rect.height);
      }
    }
  }, []);






  useEffect(() => {
    if (generateClicked) {
      setGenerateClicked(false);
    }
  }, [generateClicked]);


   
  const LogINOUTButton = () => {

    if (theUserData.userData) {
      return (
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      );
    } else {
      return (
        <button
          onClick={() => {router.push('/Login')}}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
      );
    }
  }

  

  return (
    <div className={styles.layout}>
      <div className={`${styles.toolbar} ${styles.verticalToolbar}`} ref={toolbarRef}>
        <VerticalToolbar currentTool={currentTool} onToolChange={handleToolChange} canvasRef={canvasRef} />
      </div>
      <div className={styles.content}>
        <Head>
          <title>FullJourney.AI Studio Beta 1.2</title>
          <meta name="viewport" content="initial-scale=0.7, width=device-width user-scalable=no" />
        </Head>
        <p className="pb-5 text-xl text-white text-center font-helvetica">
          <strong>FullJourney.AI9k Studio</strong>
        </p>
        <p className="text-white text-center font-helvetica">
          {userLoginNameAndCredits}
        </p>
        <main className="container mx-auto p-2">
          <div ref={toolbaroptionsRef}>
            <ToolbarOptions predictions={predictions} setPredictions={setPredictions} canvasRef={canvasRef} />
          </div>
          <div className={`border-hairline mx-auto relative`} style={{ width: `${zoomWidth < displayWidth ? displayWidth : zoomWidth}px` }} ref={canvasContainerRef}>
            <Dropzone onImageAsFirstPrediction={handleImageAsFirstPrediction} predictions={predictions} />
            <div className={`bg-black relative max-h-full mx-auto flex items-stretch border-4 border-pink-400 rounded-xl ${styles.responsiveCanvasContainer}`} style={{ width: `${zoomWidth}px` }}>
              <Canvas
                ref={canvasRef}
                generateClicked={generateClicked}
                clearMask={clearMask}
                isLoading={isLoading}
                brushSize={brushSize}
                predictions={predictions}
                setPredictions={setPredictions}
                userUploadedImage={userUploadedImage}
                onDraw={setMaskImage}
                currentTool={currentTool}
                onCanvasSizeChange={handleCanvasSizeChange}
                currentPredictionStatus={currentPredictionStatus}
                clear
              />
            </div>
          </div>
          <div id="asathisisit" ref={belowCanvasRef} className={`max-w-[512px] mx-auto mt-4`}>
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
          {LogINOUTButton()}
        </footer>
        {error && (
            <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50">
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-50"></div>
                <div className="relative bg-white p-8 rounded shadow">
                    <ErrorModal error={error} onClose={() => setError(null)} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}





  export async function getServerSideProps(context) {
  const { req, res } = context;

  // If we are working locally, we don't need to check for authentication
  if (process.env.NEXT_PUBLIC_WORKING_LOCALLY == 'true')
    return { props: {} };
  else {
  try {
      const userData = await AuthService.checkIfUserIsAlreadyLoggedIn(req, res);

      if (userData) {
        console.log("UserData returned from checkIfUserIsAlreadyLoggedIn is: ", userData)
        // The user is authenticated, pass the user data as props
        return { props: { userData } };
      }
      // If userData is null, the user is not authenticated
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  }
  // Return empty props if not authenticated
  return { props: {} };
}


/* Before adding in Google login stuff
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

      return { props: { userData } };
    } catch (error) {
      console.error('No user data, this must be a first time user Error message:', error);
      
      // Allow first-time users to access the page
      return { props: {} };
    }
  } else {
    console.log("true Inside getServerSideProps in index.js NEXT_PUBLIC_WORKING_LOCALLY is: " + process.env.NEXT_PUBLIC_WORKING_LOCALLY);

    return {
      props: {
        isAuthenticated: true,
      },
    };
  }
}*/

/* Code before letting users try the site without having to log in
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
}*/