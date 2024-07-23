import { useState, useEffect } from "react";
import sample from "lodash/sample";
import { Eraser, Dice5, DivideSquare } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTool } from '../redux/slices/toolSlice';
import Tooltip from './tooltip';
import alogger from '../utils/logger';

export default function PromptForm(props) {
  const [prompt, setPrompt] = useState("");
  const dispatch = useDispatch();
  const aspectRatioName = useSelector((state) => state.toolbar.aspectRatioName);
  const currentImageProvider = useSelector((state) => state.toolbar.provider);

  const handleClear = () => setPrompt("");
  const handleInputChange = (e) => setPrompt(e.target.value);
  
  const handleAspectRatio = () => {
    dispatch(setCurrentTool('AspectRatio'));
  };

  // Assuming index is still derived from Redux or props as before
  const index = useSelector((state) => (state.history.index - 1));

  // This line and related calculations for currentPredictionImage remain as you requested
  const currentPredictionImage = props.predictions && props.predictions.length > index && props.predictions[index]
    ? props.predictions[index].output && props.predictions[index].output.length > 0
      ? props.predictions[index].output[props.predictions[index].output.length - 1]
      : null
    : null;

  // Set the initial prompt based on the current image's prompt
  const currentImagePrompt = props.predictions && props.predictions.length > index &&
                             props.predictions[index] && props.predictions[index].input
    ? props.predictions[index].input.prompt
    : 'default'; // Default or fallback aspect ratio

  const setRandomPrompt = () => { 
    setPrompt('');
  };

  // Set an initial random prompt when the component mounts
  useEffect(() => {
    alogger('currentImagePrompt:', currentImagePrompt);

    if (currentImagePrompt && currentImagePrompt !== "default") {
      setPrompt(currentImagePrompt);
    } else {
      setRandomPrompt();
    }
  }, [index, currentImagePrompt]);


  return (
    <form
      onSubmit={props.onSubmit}
      className="py-6 animate-in fade-in duration-700"
    >
      <div className="mb-3">
        <input
          type="text"
          value={prompt}
          onChange={handleInputChange}
          name="prompt"
          placeholder="Enter a prompt..."
          className="w-full rounded-md py-3 px-4 text-xl"
        />
      </div>

      {/* Row 2: Control Buttons */}
      <div className="flex items-center space-x-3">
        {/* Eraser and Randomize buttons */}
        <div className="flex space-x-3">
          <button type="button" onClick={handleClear} className="bg-gray-200 text-gray-700 border border-gray-100 rounded-md p-3" style={{boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.8)'}}>
            <Eraser size={30} />
          </button>
        </div>

        {/* Generate button */}
        <button type="submit" className={`bg-black text-white border border-gray-400 rounded-md px-10 py-5 flex-grow text-xl`} style={{boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.8)'}}>
          Generate
        </button>

        {/* Aspect Ratio button
        <button type="button" onClick={handleAspectRatio} className="bg-gray-200 border border-gray-100 text-gray-700 rounded-md px-4 py-4 text-2xl" style={{boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.8)'}}>
          {aspectRatioName}
        </button> */}
      </div>
    </form>
  );
}