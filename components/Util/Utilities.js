
import axios from 'axios';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


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

 
    export const FSAMProcessor = async (predictionToUse, setPredictions) => {
      console.log("FSAMTest is being called");
      predictionToUse.fsamGenerationCounter = '-';
    
      if (predictionToUse === null || 
          predictionToUse.output === null ||
          !predictionToUse.output) {
        console.log("updatedPrediction contains no image to use for the FSAMProcessing");
        return;
      }
    
      const image_url = predictionToUse.output[0];
      let prediction = null;
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
          return;
        }
      } catch (error) {
        console.error('Error in handleSubmission:', error);
      }
    
      predictionToUse.fsamGenerationCounter = 0;
      console.log("Initial prediction returned is: ", prediction);
    
      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
        await sleep(1000);
        ++(predictionToUse.fsamGenerationCounter);
    
        setPredictions(currentPredictions => {
          const updatedPredictions = [...currentPredictions];
          const indexToUpdate = updatedPredictions.findIndex(p => p.id === predictionToUse.id);
          if (indexToUpdate !== -1) {
            updatedPredictions[indexToUpdate] = {
              ...updatedPredictions[indexToUpdate],
              fsamGenerationCounter: predictionToUse.fsamGenerationCounter,
            };
          }
          return updatedPredictions;
        });
    
        const response = await fetch("/api/fsam/" + prediction.id);
        const updatedPrediction = await response.json();
    
        if (response.status !== 200) {
          console.log("In fsam - Prediction errorored out detail is: ", updatedPrediction.detail);
          return;
        }
    
        if (updatedPrediction.status === "succeeded") {
          console.log("Success with mask image: ", updatedPrediction.output);
    
          let indexToUpdate = -1;
          setPredictions(currentPredictions => {
            const updatedPredictions = [...currentPredictions];
            indexToUpdate = updatedPredictions.findIndex(p => p.id === predictionToUse.id);
            if (indexToUpdate !== -1) {
              updatedPredictions[indexToUpdate] = {
                ...updatedPredictions[indexToUpdate],
                magicWandMask: updatedPrediction.output,
              };
            }
            return updatedPredictions;
          });
    
          console.log("done with magic wand mask processing! index: ", indexToUpdate);
          break;
        } else if (updatedPrediction.status === "failed") {
          console.error('In fsam - FastSAM processing failed.');
          break;
        }
      }
    };



/*
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
*/

