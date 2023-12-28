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

export default function Home( theUserData ) {
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [userUploadedImage, setUserUploadedImage] = useState(null);
  const [brushSize, setBrushSize] = useState(40); // Default brush size
  const [userData, setUserData] = useState(null);
  
  const router = useRouter();

    // Add a logout function
    const handleLogout = () => {
      // Redirect to the logout URL
      window.location.href = 'https://www.fulljourney.ai/api/auth/logoutnextjs';
    };

  useEffect(() => {
    // Check user login status on component mount
    checkUserLogin();
  }, []);

  const checkUserLogin = async () => {
    /*
    const response = await axios.get("https://www.fulljourney.ai/api/auth/set-test", { withCredentials: true }); 
    const response2 = await axios.get("https://www.fulljourney.ai/api/auth/get-test", { withCredentials: true }); 
    
    console.log("the response is: ",response);
    console.log("the response is: ",response.data);
    console.log("the response2 is: ",response2);
    console.log("the response2 is: ",response2.data);
    //const response = await axios.get("https://www.fulljourney.ai/api/auth/", { withCredentials: true });
      //console.log("the response is: ",response);
      //console.log("the response is: ",response.data);

      //setUser(response.data);
      for (var i=1;i<30;++i)
       console.log("11111111111111111111111111111111");
      */
    //  console.log('User authenticated', response.data);
    if (theUserData)       
    {
      console.log("theUserData is: ",theUserData);
      if (theUserData.userData)
      {
        console.log("theUserData.userData is: ",theUserData.userData);
        setUserData(theUserData.userData);
      }
      else
      {
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
      return;
    }

    setPredictions(predictions.concat([prediction]));

    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      const updatedPrediction = await response.json();
      if (response.status !== 200) {
        setError(updatedPrediction.detail);
        return;
      }
      setPredictions(currentPredictions => currentPredictions.concat([updatedPrediction]));

      if (updatedPrediction.status === "succeeded") {
        setUserUploadedImage(null);
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
          Logout Me Outs
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

  // Try grabbing the users data. IF we can get it, it means they've logged in successfully
  try {
    const response = await axios.get('https://www.fulljourney.ai/api/auth/', {
      headers: { Cookie: cookies },
      withCredentials: true,
    });

    // Assuming the response contains the user data you need
    const userData = response.data;

    // Return the user data as props
    return { props: { userData } };
  } catch (error) {
    console.error('Error:', error);

    // If there's an error, you can redirect or return empty props
    return {
      redirect: {
        destination: '/login',  // example redirect
        permanent: false,
      },
    };

    // Or just return empty props
    // return { props: {} };
  }
}


