import { useState } from "react";
import { useRouter } from 'next/router';
import Head from "next/head";
import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Dropzone from "components/dropzone";
import Download from "components/download";
import { XCircle as StartOverIcon } from "lucide-react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [userUploadedImage, setUserUploadedImage] = useState(null);
  const [brushSize, setBrushSize] = useState(40); // Default brush size

  
  const router = useRouter();

  useEffect(() => {
    // Check user login status on component mount
    checkUserLogin();
  }, []);

  const checkUserLogin = async () => {
    try {
      const response = await axios.get("https://www.fulljourney.ai/api/auth/", { withCredentials: true });
      setUser(response.data);
      console.log('User authenticated', response.data);
    } catch (error) {
      console.error('User not authenticated', error);
      router.push('/login'); // Redirect to login
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
  const userSessionCookie = req.cookies['discord.oauth2'];

  console.log("Here here with the userSessionCookie: " + userSessionCookie);

  if (!userSessionCookie) {
    console.log("They did not have the required cookie set!!!")
    // If there's no session cookie, redirect to the login page
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  console.log("They did have the required cookie set!!!");
  // If the session cookie is found, just continue loading the paint page
  // You could pass user data or other props here if needed
  return {
    props: {},
  };
}

/*
import { useState } from "react";
import { useRouter } from 'next/router';
import Head from "next/head";
import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Dropzone from "components/dropzone";
import Download from "components/download";
import { XCircle as StartOverIcon } from "lucide-react";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [maskImage, setMaskImage] = useState(null);
  const [userUploadedImage, setUserUploadedImage] = useState(null);
  const [brushSize, setBrushSize] = useState(40); // Default brush size
  const [user, setUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    // Check user login status on component mount
    checkUserLogin();
  }, []);

  const checkUserLogin = async () => {
    try {
      const response = await axios.get("https://www.fulljourney.ai/api/auth/", { withCredentials: true });
      setUser(response.data);
      console.log('User authenticated', response.data);
    } catch (error) {
      console.error('User not authenticated', error);
      router.push('/login'); // Redirect to login
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

// Server-side authentication check in getServerSideProps
export async function getServerSideProps(context) {
  try {
    // Replace 'fetch' with your preferred HTTP library if necessary
    const res = await fetch('https://www.fulljourney.ai/api/auth/', {
      headers: {
        Cookie: context.req.headers.cookie || '',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Not authenticated');
    }

    const user = await res.json();

    // Continue rendering the page if authenticated
    return {
      props: { user },
    };
  } catch (error) {
    console.error('Authentication error: ', error);
    // Redirect to Discord OAuth login if not authenticated
    return {
      redirect: {
        destination: 'http://www.fulljourney.ai/api/auth/nextjs',
        permanent: false,
      },
    };
  }
}
*/