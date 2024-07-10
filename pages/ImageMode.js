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
import { setCurrentTool, setBrushSize, setZoomWidth, setUserIsLoggedInWithAccount, setImageSavePath } from '../redux/slices/toolSlice';
import { undo, redo, setIndex} from '../redux/slices/historySlice'; // Adjust the import path
import ImageNavigation from '../components/ImageNavigation';
import { getSession, signOut as nextAuthSignOut } from "next-auth/react";
import { signOut } from "firebase/auth";
import { fauth } from "../utils/firebase";
const alogger = require('../utils/alogger').default;


import AuthService from '../services/authService';
import { DialerSip, WidthWideTwoTone } from "@mui/icons-material";
import { update } from "lodash";
import { current } from "tailwindcss/colors";


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));



export default function Home(theUserData) { 
    const [updateCanvasPositionNow, setUpdateCanvasPositionNow] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorRoute, setErrorRoute] = useState(null);
    const [maskImage, setMaskImage] = useState(null);
    const [userUploadedImage, setUserUploadedImage] = useState(null);
    const currentToolName = useSelector((state) => state.toolbar.currentToolName);
    const currentTool = tools.find(tool => tool.name === currentToolName);
    const brushSize = useSelector((state) => state.toolbar.brushSize);
    const dispatch = useDispatch();
    const currentImage = useSelector((state) => state.history.currentImage);
    const [userData, setUserData] = useState(null);
    const router = useRouter();
    const placeholderHandler = () => alogger('Handler not implemented yet.');
    const undoStack = useSelector((state) => state.history.undoStack);
    const [isLoading, setIsLoading] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [loadedAspectRatio, setLoadedAspectRatio] = useState('default');
    const [currentPredictionStatus, setCurrentPredictionStatus] = useState('idle');
    const [theupdatedPrediction, settheUpdatedPrediction] = useState(null);
    const canDrawToCanvas = useSelector((state) => state.toolbar.canvasDrawingEnabled);
    const imageSavePath = useSelector((state) => state.toolbar.imageSavePath);
    const [IPUser, setIPUser] = useState(false);
    const imageModel = useSelector((state) => state.toolbar.model);

    // Get the current aspect ratio's width and height
    const currentAspectRatioName = useSelector((state) => state.toolbar.aspectRatioName); 
    const hamburgerVisible = useSelector((state) => state.toolbar.hamburgerVisible);
    const hamXOffset = (hamburgerVisible ? -20 : 100);
    const hamYOffset = (hamburgerVisible ? -105 : 5);
    const hamXOffsetNoTool = (hamburgerVisible ? -10 : 0);
    const hamYOffsetNoTool = (hamburgerVisible ? 75 : 0);

    const canvasContainerRef = useRef(null);
    const toolbaroptionsRef = useRef(null);
    const canvasRef = useRef();
    const toolbarRef = useRef(null);
    const index = useSelector((state) => state.history.index - 1); 
    const belowCanvasRef = useRef(null); 
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
    const [localUserCredits, setLocalUserCredits] = useState(0);
    const [localUserIp, setLocalUserIp] = useState('');

    useEffect(() => {
      const { imageUrl, aspectRatioName } = router.query;
      alogger("received image URL and aspect ratio from router query: ", imageUrl, aspectRatioName);
    
      if (imageUrl && aspectRatioName) {
        const randomSeed = Math.floor(Math.random() * 1000000);
        
        // Extract the path without creating a URL object
        const pathParts = decodeURIComponent(imageUrl).split('/');
        const fjusersIndex = pathParts.findIndex(part => part === 'fjusers');
        const relevantPath = pathParts.slice(fjusersIndex + 1).join('/');
        
        // Remove any query parameters
        const cleanPath = relevantPath.split('?')[0];
        
        // Construct the fetchImageUrl with the relevant part of the path
        const fetchImageUrl = `/api/fetchImage?imagePath=${encodeURIComponent(cleanPath)}`;

        alogger.log("****the incoming imageUrl is: "+ imageUrl);
        alogger.log("****the cleaned up is: " + cleanPath);
        alogger.log("****the fetchImageUrl is: " + fetchImageUrl);
        
        const formattedPrediction = {
          id: randomSeed.toString(),
          status: "succeeded",
          output: [fetchImageUrl],
          created_at: new Date().toISOString(),
          fsamGenerationCounter: 0,
          aspectRatioName: aspectRatioName,
          type: 1,
          input: {
            prompt: "NOT YET AVAILABLE",
          },
        };
    
        setPredictions(predictions => predictions.concat([formattedPrediction]));
        dispatch(setIndex(predictions.length+1));
        settheUpdatedPrediction(formattedPrediction);        
      }
    }, [router.query]);
    
    // Old version of the incoming query handling code
    /*
    useEffect(() => {
      const { imageUrl, aspectRatioName } = router.query;
      alogger("received image URL and aspect ratio from router query: ", imageUrl, aspectRatioName);

      const convertImageUrlToDataUrl = async (imageUrl) => {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Error converting image URL to data URL: ", error);
          return null;
        }
      };
    
      if (imageUrl && aspectRatioName) {
        alogger("received image URL and aspect ratio from router query: ", imageUrl, aspectRatioName);
        
        convertImageUrlToDataUrl(imageUrl)
          .then((dataUrl) => {
            if (dataUrl) {
              handleImageAsFirstPrediction(dataUrl, aspectRatioName);
            }
          });
      }
    }, [router.query]);

    */



    function checkUserLoginAndCreditsForChange() {
      if (theUserData.userData) {
        if (parseInt(theUserData.userData.credits) > 100)
          setUserLoginNameAndCredits(`Username: ${theUserData.userData.discordname}`);
        else
         setUserLoginNameAndCredits(`Username: ${theUserData.userData.discordname} Credits: ${theUserData.userData.credits}`);
        
      } else {
        alogger("theUserData is not available, so using ip address to get credits: ", localUserCredits);
        setUserLoginNameAndCredits(`FREE Credits Remaining: ${localUserCredits}`);
      }
    }
    

    useEffect(() => {
      alogger("theUserData changed or component just mounted - theUserData is: ", theUserData);
      alogger("allowing use rto draw to canvas is: ", canDrawToCanvas);
      checkUserLoginAndCreditsForChange();
      
      // This is where we will make a call to our express api to get the user's default gcs bucket path(the save path for their images)
      // and set it in the redux store
      // But for now, we just set it to a default value
      let theLocalUserId;
      let ipUser = false;
    
      if (!theUserData.userData) {
        theLocalUserId = localUserIp;
        setIPUser(true);
      } else {
        setIPUser(false);
        //theLocalUserId = theUserData.userData.user_id;
        theLocalUserId = theUserData.userData.email;
      }

      const userId = theLocalUserId; //IPUser ? 'anonymous' : theLocalUserId;
      const folderPath = `BaseFolder`;
      dispatch(setImageSavePath(folderPath));
      
    }, [theUserData, localUserCredits]);


    useEffect(() => {      
    alogger("Can draw to canvas is: ", canDrawToCanvas);
    }, [canDrawToCanvas]);
    


    // Function to clear the mask
    const clearMaskImage = async () => {
   
      await canvasRef.current.setCombinedMask(null);

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
      alogger('Received Canvas Size:', size); // Log the size received from Canvas
      setCanvasSize(size); // Callback to receive canvas size
    };      

    const updateCanvasPosition = () => {
        // If the hamburger is visible, position the hambuger icon/toolbar on the toolbaroptions menu

         //alogger("1hamburgerVisible is: " + hamburgerVisible);
         alogger("canvas position updated");

          if (canvasContainerRef.current && toolbarRef.current) {
            const canvasRect = canvasContainerRef.current.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const oX = currentToolName === 'NoTool' ? hamXOffset - hamXOffsetNoTool : hamXOffset;
            const oY = currentToolName === 'NoTool' ? hamYOffset + hamYOffsetNoTool : hamYOffset;

            toolbarRef.current.style.top = `${canvasRect.top + scrollTop + oY}px`;
            toolbarRef.current.style.left = `${canvasRect.left - oX}px`;
          }

        //localStorage.setItem('imageTokens', 3);
    };

    useEffect(() => {
      if (updateCanvasPositionNow === true) {
        updateCanvasPosition();
        setUpdateCanvasPositionNow(false);
      }
    }, [updateCanvasPositionNow]);

    useEffect(() => {
      if (currentTool) {
        alogger("NoTool IS SETTING THE CANVAS POSITION");
        updateCanvasPosition();
      }
    }, [currentTool]);
    
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
      alogger("FSAMTest is being called");
      setCurrentPredictionStatus("Processing...");

      // The following code makes a call to our fsam api at /api/fsam
      if (theupdatedPrediction === null)
        {
          alogger("updatedPrediction is null");
          return;
        }


      const image_url = theupdatedPrediction.output[0];
      const prediction = null;
      setIsLoading(true);

      alogger("image_url is: ", image_url);
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
      alogger("Initial prediction returned is: ", prediction);


      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
        await sleep(1000);
        const response = await fetch("/api/fsam/" + prediction.id);
        const updatedPrediction = await response.json();
    
        if (response.status !== 200) {
          setErrorMessage( updatedPrediction.detail );
          setIsLoading(false);
          alogger("Prediction error detail is: ", updatedPrediction.detail);
          return;
        }
    
        const lastPercentage = findLastPercentageWithAdjustedGraphic(updatedPrediction.logs);
        setCurrentPredictionStatus(lastPercentage ? lastPercentage : "Processing...");
    
      
        if (updatedPrediction.status === "succeeded") {
          alogger("Success with mask image: ", updatedPrediction.output);

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
          
          alogger("updatedPredictions: " + updatedPredictions);
          alogger("updatedPrediction: " + updatedPrediction.id);



          // Call a function to handle the successful prediction
          //thettheUpdatedPrediction(updatedPrediction);
          alogger("done with magic wand mask processing! index: ", indexToUpdate);
          break;
        } else if (updatedPrediction.status === "failed") {
          setErrorMessage("The Prediction failed");
          setIsLoading(false);  
          break;
        }
      }
    };

    // updates localUserCredits to the current number of credits of the user
    const updateLocalUserCredits = async () => {
      let theLocalUserId;

      if (!theUserData.userData) {
        theLocalUserId = localUserIp;
      } else {
        theLocalUserId = theUserData.userData.user_id;
      }

      alogger("Updating local user credits for user: ", theLocalUserId, "...");


      try {
        const userCredits = await axios.get("/api/user/getCredits", {
          userId: theLocalUserId,
        });
        alogger("User credits are: ", userCredits);
        setLocalUserCredits(userCredits);
      } catch (error) {
        console.error("Error updating local user credits:", error);
        return;
      }
    };

    const handleViewModePush = () => {
      router.push('/ViewMode');
    };

    const handleLogin = async () => {
      alogger("Logging in the user...");

      await handleLogout(false);
      router.push('/LoginForm');
    };

    const handleLogout = async (redirect = false) => {
      alogger("Logging out the user...");
  
      try {
          // Logout from NextAuth first
          await nextAuthSignOut({ redirect: false });
          alogger("NextAuth sign-out successful.");
  
          // Then logout from Firebase
          await signOut(fauth);
          alogger("Firebase Sign-out successful.");
  
          // Clear the user data cookie by setting an expired cookie
          const expiredUserDataCookie = serialize('user', '', {
              httpOnly: true,
              secure: process.env.NODE_ENV !== 'development',
              sameSite: 'strict',
              expires: new Date(0),  // Set the expiration date to the past
              path: '/',
          });
  
          // Set the expired cookie in the document
          document.cookie = expiredUserDataCookie;
          alogger("User cookie cleared.");
  
          // Finally, redirect the user
          if (redirect)
            window.location.href = 'https://www.craftful.ai/api/auth/logoutnextjs';
      } catch (error) {
          alogger("Error during sign out process:", error);
      }
  };

    useEffect(() => {
      
      // Check if the user is logged in
      checkUserLogin();

      // Setup the current tool
      const currentTool = tools.find(tool => tool.name === currentToolName);
      if (currentTool) {
          alogger("ImageMode.js: Setting up the current tool: ", currentToolName);
          currentTool.setup(dispatch);
      } else {
          alogger("Failed to be able to setup the current tool!!! currentTool is null - currentToolName is: ", currentToolName);
      }

      // Get ip address
      // use ip to log into express api's freeuser route
      // this returns their credits based on ip address
      // we store this in its localUserCredits var
      const getIP = async () => {
          alogger("getIP is Getting IP address...");
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          //alogger("Response from ipify.org is: ", data);
          setLocalUserIp(data.ip);
          //alogger("Yours IP address is: ", data.ip);
          const userCredits = await AuthService.getFreeUserCredits(data.ip); // directly use data.ip here
          //alogger("User credits are: ", userCredits);
          setLocalUserCredits(userCredits);
      }
      getIP();
  }, []);

     const checkUserLogin = async () => {
        if (!theUserData) {
          dispatch(setUserIsLoggedInWithAccount(false));
        } else {
            if (theUserData.userData) {
                dispatch(setUserIsLoggedInWithAccount(true));
                setUserData(theUserData.userData);
            } else {
                dispatch(setUserIsLoggedInWithAccount(false));
            }
        }
    };

  
    useEffect(() => {
      dispatch(setZoomWidth(displayWidth));
    }, [displayWidth]);


    // Position the toolbar based on the viewport and canvas container
    useEffect(() => {
          if (canvasContainerRef.current && toolbarRef.current) {
            const canvasRect = canvasContainerRef.current.getBoundingClientRect();
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const oX = currentToolName === 'NoTool' ? hamXOffset - hamXOffsetNoTool : hamXOffset;
            const oY = currentToolName === 'NoTool' ? hamYOffset + hamYOffsetNoTool : hamYOffset;

            toolbarRef.current.style.top = `${canvasRect.top + scrollTop + oY}px`;
            toolbarRef.current.style.left = `${canvasRect.left - oX}px`;
          }
    }, [zoomWidth, hamburgerVisible]);


    // This function puts the image with given aspectRatio into end of the predictions array
    //
    // Dropzone calls this function When the user uploads an image
    // ViewMode calls this function when the user clicks on an image in their bucket that they want to edit/play with
    //  the image data URL and aspect ratio name(see toolSlice) calculated from the image's dimensions
    const handleImageAsFirstPrediction = (imageDataUrl, aspectRatio) => {
      alogger("handleImageAsFirstPrediction called with image data URL: ", imageDataUrl, " and aspect ratio: ", aspectRatio);
      const newPrediction = {
        id: 'local-image', // or generate a unique ID as needed
        output: [imageDataUrl],
        status: 'succeeded', // or the appropriate status
        aspectRatioName: aspectRatio,
      };

      setPredictions([newPrediction, ...predictions]);
     // alogger("setting index to predictions.length: " + predictions.length);
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
          alogger("(newCredits < 0");
          newCredits = 0;
          localStorage.setItem('imageTokens', newCredits);
          return false;
        }
      else
        {
          alogger("(newCredits >= 0");
          return true;
        }
    };

/*
    0 - Dreamshaper
    1 - RealVis xl 4.0

*/
    const GetRequestBody = (e, combinedMask, currentPredictionOutput, width, height, currentAspectRatioName, theLocalUserId, ipUser, userEmail) => {  
      let body = null;
      const randomSeed = Math.floor(Math.random() * 1000000);
      body = {
        prompt: e.target.prompt.value,
        foldername: imageSavePath,
        negative_prompt: '(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)',
        modelid: 0,
        seed: randomSeed,
        userid: theLocalUserId,
        userEmail: userEmail,
        ipUser: ipUser,
        width,
        height,
        image: combinedMask ? currentPredictionOutput : null,
        mask: combinedMask,
        noCheck: true,
      };

      return body;
    };


    const convertImageUrlToDataUrl = async (imageUrl) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error converting image URL to data URL: ", error);
        return null;
      }
    };

    const handleSubmit = async (e) => {
      setIsLoading(true);
      e.preventDefault();

      const combinedMask = await canvasRef.current.getCombinedMask();
      const currentPrediction = predictions[index];
      const currentPredictionOutput = currentPrediction?.output ? currentPrediction.output[currentPrediction.output.length - 1] : null;
      const { width, height } = getResolution(currentAspectRatioName);
        
      let theLocalUserId = document.cookie.replace(/(?:(?:^|.*;\s*)userId\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      let ipUser = false;
      let userEmail = '';
      let idToUse = theLocalUserId;

      if (!theUserData.userData) {
        theLocalUserId = localUserIp;
        idToUse = localUserIp;  
        ipUser = true;
        alogger("There was no USERDATA to load, so treating this call as a local user");
      } else {
        alogger("There is USERDATA!!!, so using that and the userEmail");
       
        ipUser = false;
        theLocalUserId = theUserData.userData.user_id;
        userEmail = theUserData.userData.email;
        idToUse = theUserData.userData.email;
      }


      if (theUserData.userData)
        alogger(" theUserData.userData.user_id is: ", theUserData.userData.user_id);
      else
       {
        alogger("theUserData.userData is null, so using localUserIp: ", localUserIp);
       }
      const body = GetRequestBody(e, combinedMask, currentPredictionOutput, width, height, currentAspectRatioName, theLocalUserId,ipUser,userEmail);
      //alogger("Generation request Body is: ", body);  
    
      setCurrentPredictionStatus("Processing...");

      let response = null;
      let attempts = 0;
      let fileName = null;
      let prediction = null;

      // we will try to generate the image 3 times before giving up
      while (attempts < 3) {
        try {
          response = await axios.post("/api/generateImage", body);
          prediction = response.data;

          if (prediction.error) {
            console.error("Error in /api/generateImage:", prediction.error, " - Retrying...");
            fileName = null;
          } else {
            fileName = prediction.output; // Just use the filename directly
            break;
          }
        } catch (error) {
          console.error("Error in handleSubmit:", error);
          setIsLoading(false);
          return;
        }
        attempts++;
      }

      if (response.data.status !== 201) {
        console.error("response.data.statuss is not 402 it is:", response.data.status);

        if (prediction.thecode === 5001) {
          if (response.data.status === 404) {
            setErrorMessage("The Prediction failed");
            setIsLoading(false);
            return;
          } else if (response.data.status === 403) {
            setErrorMessage("You have run out of credits, please subscribe or buy more credits");
            setErrorRoute('/Subscribe');
            setIsLoading(false);
            return;
          } else if (response.data.status === 402) {
            setErrorMessage("You have run out of credits, please login to continue");
            setErrorRoute('/LoginForm');
            setIsLoading(false);
            return;
          }
        }
      }

      if (fileName === null) {
        setErrorMessage("Failed to generate the image. Please try again.");
        alert("Failed to generate the image. Please try again.");
        setIsLoading(false);
        return;
      }

      const path = `https://storage.googleapis.com/fjusers/${idToUse}/BaseFolder/generatedImages/${fileName}`;
      alogger("Response from /api/generateImage:", response.data);
      alogger("Filename from genimage:", fileName);
      console.log("****PATH IS: ",path);

  /* OLD CODE TO CHECK IF THE IMAGE IS THERE YET(AS WE USED TO TRY TO LOAD THE IMAGE IMMEDIATELY)
  // the following uses the above code to check if the image exists in the bucket using =${encodeURIComponent(path)}
  // if it does not exist, we return a 404 error
  try {
    const response = await fetch(`/api/bucketFileExists?imagePath=${encodeURIComponent(path)}`);
    const data = await response.json();
    if (response.status !== 200) {
      setErrorMessage({ message: data.message });
      setIsLoading(false);
      return;
    }

    alogger('Image exists in the bucket:', data.message);

  } catch (error) {
    console.error('Error checking if image exists in the bucket:', error);
    setError({ message: 'Failed to check if the image exists in the bucket. Please try again.' });
    setIsLoading(false);
    return;
  }*/

      const fetchImageUrl = `/api/fetchImage?imagePath=${encodeURIComponent(path)}`;
      console.log("****fetchImageUrl: ",fetchImageUrl);
    
      const formattedPrediction = {
        id: body.seed.toString(),
        status: "succeeded",
        output: [fetchImageUrl],  // Use the fetchImage API route URL
        created_at: new Date().toISOString(),
        fsamGenerationCounter: 0,
        aspectRatioName: currentAspectRatioName,
        type: 1,
        input: {
          prompt: body.prompt,
        },
      };
    
      setPredictions(predictions.concat([formattedPrediction]));
      dispatch(setIndex(predictions.length+1));
      setIsLoading(false);

      //await updateLocalUserCredits();
    
        return;

      if (provider === 'Fal') {
        alogger("Prediction response from FAL:", prediction);
        

        const formattedPrediction = {
          id: prediction.seed.toString(),
          status: "succeeded",
          output: [prediction.images[0].url],
          created_at: new Date().toISOString(),
          fsamGenerationCounter: 0,
          aspectRatioName: currentAspectRatioName,
          type: 1, // 1 for FAL, 0 for Replicate
          input: {
            prompt:  prediction.prompt,
          },
        };
          
        // Add the formatted prediction to the predictions array
        setPredictions(predictions.concat([formattedPrediction]));
        dispatch(setIndex(predictions.length));
    
        // Save the image to the user's bucket if the user is logged in
        if (!ipUser) {
          alogger("User is logged in, so saving image to: ", imageSavePath);
          const imageUrl = formattedPrediction.output[0];
          
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
              const base64data = reader.result.split(',')[1];
              const fileName = `${imageSavePath}${formattedPrediction.id}.jpg`;
    
              // Upload the generated image to Google Cloud Storage on the server side
              const uploadResponse = await fetch('/api/uploadImage', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  bucketName: 'fjusers',
                  fileName: fileName,
                  fileContent: base64data
                })
              });
    
              const data = await uploadResponse.json();
              alogger(data.message);
            };
          } catch (error) {
            console.error('Error uploading image:', error);
            setError({ message: 'Failed to upload the generated image. Please try again.' });
          }
        } else {
          alogger("User not logged in, so not saving image!");
        }
    
        dispatch(setIndex(predictions.length + 1));
    
        setIsLoading(false);
        clearMaskImage();
        setGenerateClicked(true);
        return;
      } 
      
      if (provider === 'Replicate'){
        alogger("Provider is Replicate so Prediction response from Replicate:", prediction);
        
        prediction.fsamGenerationCounter = 0;
        if (response.status !== 201) {
          if (prediction.thecode === 5001) {
            if (response.status === 404) {
              return;
            } else if (response.status === 403) {
              setError({ message: "You have run out of credits, please subscribe or buy more credits" });
              setIsLoading(false);
              router.push('/Subscribe');
              return;
            } else if (response.status === 402) {
              setError({ message: "You have run out of credits, please login to continue" });
              setIsLoading(false);
              router.push('/LoginForm');
              return;
            }
          }
        }
          
        setPredictions(predictions.concat([prediction]));
        dispatch(setIndex(predictions.length));
          
        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
            await sleep(1000);
            

            const response = await fetch(`/api/predictions/${prediction.id}?provider=${provider}`);
            const updatedPrediction = await response.json();
            
            if (response.status !== 200) {
              setError({ message: updatedPrediction.detail });
              setIsLoading(false);
              return;
            }
            
            const lastPercentage = findLastPercentageWithAdjustedGraphic(updatedPrediction.logs);
            setCurrentPredictionStatus(lastPercentage ? lastPercentage : "Processing...");
            
            if (updatedPrediction.status === "succeeded") {
              setPredictions(currentPredictions => {
                const updatedPredictions = [...currentPredictions];
                const indexToUpdate = updatedPredictions.findIndex(p => p.id === updatedPrediction.id);
                if (indexToUpdate !== -1) {
                  updatedPredictions[indexToUpdate] = {
                    ...updatedPrediction,
                    aspectRatioName: currentAspectRatioName,
                  };
            
                  // Don't save the image if the user is not logged in
                  if (ipUser === true) {
                    alogger("User not logged in, so not saving image!");
                  } else {
                    alogger("User is logged in, so saving image to: ", imageSavePath);
                    // Fetch image as a Blob and convert it to base64
                    fetch(updatedPrediction.output[0])
                      .then(response => response.blob())
                      .then(blob => {
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = () => {
                          const base64data = reader.result.split(',')[1];
              
                          const fileName = `${imageSavePath}${updatedPrediction.id}.jpg`;
              
                          // Upload the generated image to Google Cloud Storage on the server side
                          fetch('/api/uploadImage', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              bucketName: 'fjusers',
                              fileName: fileName,
                              fileContent: base64data
                            })
                          })
                          .then(response => response.json())
                          .then(data => {
                            alogger(data.message);
                          })
                          .catch(error => {
                            console.error('Error uploading image:', error);
                            setError({ message: 'Failed to upload the generated image. Please try again.' });
                          });
                        };
                      });
                  }
                }
                return updatedPredictions;
              });
            
              dispatch(setIndex(predictions.length + 1));
              setIsLoading(false);
            
              settheUpdatedPrediction(updatedPrediction);
            
              if (ipUser === true) {
                const userCredits = await AuthService.getFreeUserCredits(theLocalUserId);
                setLocalUserCredits(userCredits);
              }
            
              clearMaskImage();
              setGenerateClicked(true);
            
              break;
            } else if (updatedPrediction.status === "failed") {
              setError({ message: "The Prediction failed" });
              setIsLoading(false);
              break;
            }
          }
        }
    };
    



    const startOver = () => {

        canvasRef.current.ClearMaskLines();
        canvasRef.current.ClearMagicWandResult();
        setPredictions([]);
        setErrorMessage(null);
        setMaskImage(null);
        setUserUploadedImage(null);
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


  useEffect(() => {
    if (generateClicked) {
      setGenerateClicked(false);
    }
  }, [generateClicked]);


  const ModeButton = () => {
    if (!IPUser) {
      return (
        <button onClick={handleViewModePush} 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            View My Images
            </button>
            );
    } else {
      return (<div>hi</div>)
    }
  }

   
  const LogINOUTButton = () => {

    if (theUserData.userData) {
      return (
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Logout
        </button>
      );
    } else {
      return (
        <button
          onClick={handleLogin}
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
          <title>CraftFul.ai Studio V1.0</title>
          <meta name="viewport" content="initial-scale=0.7, width=device-width user-scalable=no" />
        </Head>
        <p className="pb-5 text-xl text-white text-center font-helvetica">
          <strong>CraftFul.a.i Studio</strong>
        </p>
        <div className="flex flex-col items-center">
        <p className="text-white text-center font-helvetica">
          {ModeButton()}          
          {LogINOUTButton()}
          {userLoginNameAndCredits}
        </p>
        </div>
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
        {errorMessage && (
            <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50">
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-50"></div>
                <div className="relative bg-white p-8 rounded shadow">
                    <ErrorModal error={{ message: errorMessage, route: errorRoute }} onClose={() => setErrorMessage(null)} />
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
        alogger("UserData returned from checkIfUserIsAlreadyLoggedIn is: ", userData)
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