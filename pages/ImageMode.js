import { useRef, useState, useEffect, useMemo } from "react";
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
import { undo, redo, setIndex, setUserId, setViewModeLoadedImages } from '../redux/slices/historySlice';
import ImageNavigation from '../components/ImageNavigation';
import { getSession, signOut as nextAuthSignOut } from "next-auth/react";
import { signOut } from "firebase/auth";
import { fauth } from "../utils/firebase";
import WorkspaceProcessor from '../components/WorkspaceProcessor';
import ImageMenu from '../components/ImageMenu';
import YesNoModal from '../components/YesNoModal'; 

const alogger = require('../utils/alogger').default;

import AuthService from '../services/authService';
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
    const currentUserId = useSelector((state) => state.history.userId);
    const viewModeLoadedImages = useSelector((state) => state.history.viewModeLoadedImages);

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
    const workspaceProcessorRef = useRef();

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

    const [generateClicked, setGenerateClicked] = useState(false);              // Keep track of the generate button click, so that canvas knows when to reset it mask data
    const [isDropzoneActive, setIsDropzoneActive] = useState(false);            // Used to manually activate the dropzone component
    const dropzoneRef = useRef(null);

    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [isYesNoModalOpen, setIsYesNoModalOpen] = useState(false);
    const [imageIndexToDelete, setImageIndexToDelete] = useState(null);

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
    const [maxNavigationWidth, setMaxNavigationWidth] = useState(1024);          // Default max width for image navigation component

    alogger('ImageMode component has started rendering');

    useEffect(() => {
      alogger('ImageMode first useEffect fired');
    }, []);

    const handleDeleteImage = (indexToDelete) => {
      setPredictions(prevPredictions => {
          const newPredictions = prevPredictions.filter((_, i) => i !== indexToDelete);
          dispatch(setIndex(index));
          return newPredictions;
      });
  };

  const handleOpenYesNoModal = (index) => {
      setImageIndexToDelete(index);
      setIsYesNoModalOpen(true);
  };

  const handleCloseYesNoModal = () => {
      setIsYesNoModalOpen(false);
      setImageIndexToDelete(null);
  };

  const handleConfirmDelete = () => {
      if (imageIndexToDelete !== null) {
          handleDeleteImage(imageIndexToDelete);
      }
      handleCloseYesNoModal();
  };

  const menuItems = useMemo(() => [
      {
          label: 'Delete Image',
          onClick: () => {
              if (selectedImageIndex !== null) {
                  handleOpenYesNoModal(selectedImageIndex);
              }
          },
      },
      // Add more menu items here in the future
  ], [selectedImageIndex]);


useEffect(() => {
  alogger('ImageMode component has started rendering');
}, []);

const handleOpenMenu = (event, index, position) => {
  alogger("Opening menu for image index:", index);

  if (canvasContainerRef.current) {
    const canvasRect = canvasContainerRef.current.getBoundingClientRect();
    alogger("Canvas position is: ", canvasRect.left, canvasRect.top);
    alogger("Event position is: ", position.x, position.y);
    const adjustedPosition = {
      x: canvasRect.left + position.x,
      y: canvasRect.top + position.y,
    };

    setSelectedImageIndex(index);
    setMenuPosition(adjustedPosition);
    setMenuOpen(true);
  }
};

const handleCloseMenu = () => {
  setMenuOpen(false);
  setSelectedImageIndex(null);
};
    
    // When the user wants to manually upload an image, they click the upload button
    const handleUploadClick = () => {
      alogger('Upload button clicked'); 
      if (dropzoneRef.current) {
        dropzoneRef.current.openFilePicker();
      }
    };


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


    const handleSaveWorkspace = () => {
      if (workspaceProcessorRef.current) {
          workspaceProcessorRef.current.saveWorkspace();
      }
    };
    

    useEffect(() => {
      alogger("theUserData changed or component just mounted - theUserData is: ", theUserData);
      alogger("allowing use rto draw to canvas is: ", canDrawToCanvas);
      checkUserLoginAndCreditsForChange();

      let theLocalUserId = '';
      let ipUser = false;
    
      if (!theUserData.userData) {
        theLocalUserId = localUserIp;
        setIPUser(true);
      } else {
        setIPUser(false);
        //theLocalUserId = theUserData.userData.user_id;
        theLocalUserId = theUserData.userData.email;

        // we only want to load the workspace if the user is logged in(ip users don't have workspaces)
        //loadWorkspace(theLocalUserId);
      }

    
      const folderPath = `BaseFolder`;
      dispatch(setImageSavePath(folderPath));
      
    }, [theUserData, localUserCredits]);



    useEffect(() => {      
    alogger("Can draw to canvas is: ", canDrawToCanvas);
    }, [canDrawToCanvas]);
    


    // Function to clear the mask
    const clearMaskImage = async () => {
   
      alogger("CLEAR - clearMaskImage is being called");
      await canvasRef.current.clearCombinedMask();

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
    

/* old code before adding the new imagenavigation variable width
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
*/

useEffect(() => {
  const handleScroll = () => {
      updateCanvasPosition();
  };

  const updateMaxWidth = () => {
      const canvasWidth = canvasContainerRef.current?.offsetWidth || 512;
      setMaxNavigationWidth(Math.min(canvasWidth, 512));
  };

  updateCanvasPosition();
  updateMaxWidth();
  
  window.addEventListener('resize', updateCanvasPosition);
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', updateMaxWidth);

  return () => {
      window.removeEventListener('resize', updateCanvasPosition);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateMaxWidth);
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


    const handleViewModePush = () => 
      {
      setIsLoading(true);
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


    const formatFileUrl = (url) => {
      if (!url.includes('https://storage.googleapis.com/fjusers/')) {
        const fullStorageUrl = `https://storage.googleapis.com/fjusers/${url.split('imagePath=')[1]}`;
        return `/api/fetchImage?imagePath=${encodeURIComponent(fullStorageUrl)}`;
      }
      return url;
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
  }, []);



    // Function to load the workspace from the user's GCS bucket
    const LoadWorkspace = async () => {
      let newPredictionsCount = 0;
      alogger("Attempting to LoadWorkspace in ImageMode.js...");
    
      if (workspaceProcessorRef.current) {
        const loadedWorkspace = await workspaceProcessorRef.current.loadWorkspace();
        alogger("Loaded workspace is: ", loadedWorkspace);
    
        if (loadedWorkspace && loadedWorkspace.currentFiles) {
          // Convert the loaded files into the format expected by predictions
          const loadedPredictions = loadedWorkspace.currentFiles.map(file => {
            alogger("Loaded file url is: ", file.fileUrl);
            return {
            id: file.id || Math.random().toString(36).substr(2, 9),
            status: "succeeded",
            output: [file.fileUrl],
            fileUrl: file.fileUrl,
            created_at: file.created_at || new Date().toISOString(),
            fsamGenerationCounter: file.fsamGenerationCounter || 0,
            aspectRatioName: file.aspectRatioName || "1:1", // default to 1:1 if not provided
            type: file.type || 1,
            input: {
              prompt: file.input?.prompt || "NOT YET AVAILABLE",
            },
            };
          });
    
          // Update the predictions state
          setPredictions(loadedPredictions);

          newPredictionsCount = loadedPredictions.length;
          alogger("First Loaded predctions count is: ", newPredictionsCount);
    
          // Update the image save path if it exists in the loaded workspace
          if (loadedWorkspace.imageSavePath) {
            dispatch(setImageSavePath(loadedWorkspace.imageSavePath));
          }
    
          alogger("Predictions loaded from workspace: ", loadedPredictions);
        } else {
          alogger("No currentFiles found in loaded workspace");
        }
      } else {
        alogger("WorkspaceProcessor is not available to load the workspace.");
      }


      // If the user clicked on an image in ViewMode, load it into the predictions array
      if (viewModeLoadedImages && viewModeLoadedImages.imageUrl && viewModeLoadedImages.aspectRatioName) {
        alogger("Image URL:", viewModeLoadedImages.imageUrl);
        alogger("Aspect Ratio Name:", viewModeLoadedImages.aspectRatioName);
        const randomSeed = Math.floor(Math.random() * 1000000);
        
        // Decode the URL once
        const decodedUrl = decodeURIComponent(viewModeLoadedImages.imageUrl);
        
        alogger("The original imageUrl from viewModeLoadedImages.imageUrl is: ", decodedUrl);

        // Extract the path without creating a URL object
        const pathParts = decodedUrl.split('/');
        const fjusersIndex = pathParts.findIndex(part => part === 'fjusers');
        const relevantPath = pathParts.slice(fjusersIndex + 1).join('/');
        
        // Remove any query parameters
        const cleanPath = relevantPath.split('?')[0];

        // If the path is not a proper GCS path, construct the GCS path
        alogger("url before encoding is `/api/fetchImage?imagePath=" + cleanPath + "`");
        const cleanPathPlus = `/api/fetchImage?imagePath=${cleanPath}`;
        let newUrl = null;
        if (!cleanPathPlus.includes('storage.googleapis.com')) {
          const secondPart = cleanPathPlus.substring(cleanPathPlus.indexOf('imagePath=')+10, cleanPathPlus.length);
          newUrl = `https://storage.googleapis.com/fjusers/${secondPart}`;
          alogger('newUrl is: ', newUrl);
        }

        

        // Construct the fetchImageUrl with the relevant part of the path
        let fetchImageUrl;

        // Use the newly correct
        if (newUrl) 
          fetchImageUrl = `/api/fetchImage?imagePath=${encodeURIComponent(newUrl)}`;
        else
          fetchImageUrl = `/api/fetchImage?imagePath=${encodeURIComponent(cleanPath)}`;

        
      
        // No need to use formatFileUrl here as we've already formatted it correctly
        alogger("***The formatted file URL is: ", fetchImageUrl);
        const formattedPrediction = {
          id: randomSeed.toString(),
          status: "succeeded",
          output: [fetchImageUrl],
          fileUrl: fetchImageUrl,
          created_at: new Date().toISOString(),
          fsamGenerationCounter: 0,
          aspectRatioName: viewModeLoadedImages.aspectRatioName,
          type: 1,
          input: {
            prompt: "NOT YET AVAILABLE",
          },
        };

         // Load CFT data
         const cftData = await loadCFTData(currentUserId, fetchImageUrl);
         if (cftData) {
           alogger("CFT data found for the uploaded image:", cftData);
           formattedPrediction.input = cftData;
         } else {
           alogger("No CFT data found for the uploaded image:", fileName);
         } 
      
        setPredictions(predictions => predictions.concat([formattedPrediction]));
        settheUpdatedPrediction(formattedPrediction);
      
        newPredictionsCount += 1;
        alogger("Incoming total Loaded predctions count is: ", newPredictionsCount);
      
         
        
        // reset the viewModeLoadedImages(we only want to load it once)
        dispatch(setViewModeLoadedImages({}));
      }
      
      dispatch(setIndex((newPredictionsCount)));
    };

     const checkUserLogin = async () => {
  
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
            dispatch(setUserId(data.ip));
            alogger("Yours IP address is: ", data.ip);
            const userCredits = await AuthService.getFreeUserCredits(data.ip); // directly use data.ip here
            //alogger("User credits are: ", userCredits);
            setLocalUserCredits(userCredits);
        }


        if (!theUserData) {
          dispatch(setUserIsLoggedInWithAccount(false));
          getIP();
        } else {
            if (theUserData.userData) {
                dispatch(setUserIsLoggedInWithAccount(true));
                dispatch(setUserId(theUserData.userData.email));
            } else {
                dispatch(setUserIsLoggedInWithAccount(false));
                getIP();
            }
        }
    };

    useEffect(() => {
      if (currentUserId) {
        alogger("Current user ID changed or component just mounted - currentUserId is: ", currentUserId);
        LoadWorkspace();
      }
  }, [currentUserId]);

  
    useEffect(() => {
      dispatch(setZoomWidth(displayWidth));
    }, [displayWidth]);


    useEffect(() => {
      alogger("ASASAASASASA - theUserData.email changed or component just mounted - theUserData is: ", theUserData);
  }, [ theUserData]);

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


    const loadCFTData = async (userId, imagePath) => {
      const decodedUrl = decodeURIComponent(imagePath);

      // Format the fileAndPath to remove the GCS URL
      // example: this line 
      // "/api/fetchImage?imagePath=https://storage.googleapis.com/fjusers/172.56.201.232/BaseFolder/generatedImages/output962867.png"
      // becomes this line
      // "172.56.201.232/BaseFolder/generatedImages/output962867.png"
      const fileName = decodedUrl.replace(/^.*fjusers\//, '');

      try {
        const response = await axios.post('/api/loadCFT', {
          userId,
          fileAndPath: fileName,
        });
        
        if (response.status === 200) {
          return response.data;
        } else {
          console.error('Failed to load CFT data:', response.data.message);
          return null;
        }
      } catch (error) {
        console.error('Error loading CFT data:', error);
        return null;
      }
    };



    // This function puts the image with given aspectRatio into end of the predictions array
    //
    // Dropzone calls this function When the user uploads an image
    // ViewMode calls this function when the user clicks on an image in their bucket that they want to edit/play with
    //  the image data URL and aspect ratio name(see toolSlice) calculated from the image's dimensions
    // Old function before we started using gcs bucket for images
    const handleImageAsFirstPrediction = async (imageDataUrl, aspectRatio) => {
      alogger("handleImageAsFirstPrediction called with aspect ratio: ", aspectRatio);
      
      const randomSeed = Math.floor(Math.random() * 1000000);
      const fileName = `user_upload_${randomSeed}.jpg`;
      const bucketName = 'fjusers'; // Replace with your actual bucket name
      
      try {
        // Remove the data:image/jpeg;base64, part from the data URL
        const base64Content = imageDataUrl.split(',')[1];
        
        // Prepare the request body
        const body = JSON.stringify({
          bucketName,
          fileName,
          fileContent: base64Content
        });
        
        // Upload the image using the existing API route
        const uploadResponse = await fetch('/api/uploadImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        } 
        
        // Construct the URL for the uploaded image
       // const path =   `https://storage.googleapis.com/fjusers/${idToUse}/BaseFolder/generatedImages/${fileName}`;
        alogger("The body is: ", body);

        const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        
        // Use the returned URL, which should be compatible with your bucketFileExists API
        const fetchImageUrl = `/api/fetchImage?imagePath=${encodeURIComponent(fileUrl)}`;
    
        alogger("The formatted file URL is: ", fetchImageUrl);
        
        const formattedPrediction = {
          id: randomSeed.toString(),
          status: "succeeded",
          output: [fetchImageUrl],
          fileUrl: fetchImageUrl,
          created_at: new Date().toISOString(),
          fsamGenerationCounter: 0,
          aspectRatioName: aspectRatio,
          type: 1,
          input: {
            prompt: "User uploaded image",
          },
        };
    
        setPredictions(prevPredictions => [formattedPrediction, ...prevPredictions]);
        settheUpdatedPrediction(formattedPrediction);
        dispatch(setIndex((predictions.length+1)));

        // Load CFT data
        const cftData = await loadCFTData(currentUserId, fileName);
        if (cftData) {
          alogger("CFT returned by loadCFTData for the uploaded image:", cftData);
          // Update the prediction with CFT data
          setPredictions(prevPredictions => {
            const updatedPredictions = [...prevPredictions];
            updatedPredictions[0] = {
              ...updatedPredictions[0],
              input: cftData
            };
            return updatedPredictions;
          });
        } else {
          alogger("No CFT data found for the uploaded image:", fileName);
        }

        
        alogger("New prediction added to the beginning of the array");
      } catch (error) {
        console.error("Error uploading image:", error);
        // Handle the error appropriately, maybe show a message to the user
      }
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

      if (combinedMask)
      {
        alogger("GetRequestBody called with combinedMask is: ", combinedMask);
      } else {
        alogger("GetRequestBody called with combinedMask is NULL");
      }

      body = {
        prompt: e.target.prompt.value,
        foldername: imageSavePath,
        //negative_prompt: '(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)',
        modelid: imageModel,
        seed: randomSeed,
        userid: theLocalUserId,
        userEmail: userEmail,
        ipUser: ipUser,
        width,
        height,
        image: combinedMask ? currentPredictionOutput : null,
        mask: combinedMask,
        noCheck: process.env.NODE_ENV !== 'local',
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
      alogger("****PATH IS: ",path);

      const fetchImageUrl = `/api/fetchImage?imagePath=${encodeURIComponent(path)}`;
      alogger("****fetchImageUrl: ",fetchImageUrl);
    
      const formattedPrediction = {
        id: body.seed.toString(),
        status: "succeeded",
        output: [fetchImageUrl],  // Use the fetchImage API route URL
        fileUrl: fetchImageUrl,
        created_at: new Date().toISOString(),
        fsamGenerationCounter: 0,
        aspectRatioName: currentAspectRatioName,
        type: 1,
        input: {
          prompt: body.prompt,
          negative_prompt: body.negative_prompt,
          modelid: body.modelid,
        },
      };
    
      setPredictions(predictions.concat([formattedPrediction]));
      dispatch(setIndex((predictions.length+1)));
      setIsLoading(false);

      await clearMaskImage();

      //await updateLocalUserCredits();
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
    if (!IPUser || 1) {
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
        <WorkspaceProcessor 
          ref={workspaceProcessorRef} 
          userId={theUserData.userData ? theUserData.userData.email : localUserIp}
          predictions={predictions}
        />
        <Head>
          <title>CraftFul.ai Studio V1.0</title>
          <meta name="viewport" content="initial-scale=0.7, width=device-width user-scalable=no" />
        </Head>
        <p className="pb-5 text-xl text-white text-center font-helvetica">
          <strong>CraftFul a.i Studio</strong>
        </p>
        <div className="flex flex-col items-center">
        <p className="text-white text-center font-helvetica">
          <button onClick={handleViewModePush} 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              View My Images
          </button>
          {theUserData.userData ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </button>
          )}
          {userLoginNameAndCredits}
        </p>
        </div>
        <main className="container mx-auto p-2">
          <div ref={toolbaroptionsRef}>
            <ToolbarOptions predictions={predictions} setPredictions={setPredictions} canvasRef={canvasRef} />
          </div>
          <div className={`border-hairline mx-auto relative`} style={{ width: `${zoomWidth < displayWidth ? displayWidth : zoomWidth}px` }} ref={canvasContainerRef}>
            <Dropzone 
              ref={dropzoneRef}
              onImageAsFirstPrediction={handleImageAsFirstPrediction} 
              predictions={predictions} 
              onDropComplete={() => {/* handle drop complete if needed */}}
            />
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
                onOpenMenu={handleOpenMenu}
                clear
            />
          </div>
          </div>
          <div className="relative mx-auto mt-4" style={{ maxWidth: `${maxNavigationWidth}px` }}>
            <div className="flex justify-between items-center mb-2">
              <button 
                onClick={handleUploadClick}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                IMG
              </button>
              <ImageNavigation imageTotal={predictions.length} maxWidth={maxNavigationWidth+25} />
                <div 
                  className="text-right text-pink-400">
                <div className="text-center">saving to</div>
                <div className="text-center">{imageSavePath}</div>
              </div>
            </div>
            <div id="asathisisit" ref={belowCanvasRef}>
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
      <ImageMenu
          open={menuOpen}
          onClose={handleCloseMenu}
          menuItems={menuItems}
          anchorPosition={menuPosition}
      />
      <YesNoModal
          open={isYesNoModalOpen}
          onClose={handleCloseYesNoModal}
          onYes={handleConfirmDelete}
          onNo={handleCloseYesNoModal}
          title="Confirm Deletion"
          message="Are you sure you want to delete this image?"
     />
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