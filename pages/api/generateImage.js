import axios from 'axios';
import FormData from 'form-data';
import { Storage } from '@google-cloud/storage';
import axiosRetry from 'axios-retry';
import util from 'util';
import alogger from '../../utils/alogger';


// Configure axios-retry
axiosRetry(axios, {
  retries: 3, // number of retries
  retryDelay: axiosRetry.exponentialDelay, // exponential back-off
  retryCondition: (error) => {
    // Retry on any network or 5xx error
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
  },
});

// Response size limit is set to 30MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  }
}

let storage;

if (process.env.VERCEL) {
  const serviceAccountKey = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  storage = new Storage({ credentials: serviceAccountKey });
} else {
  storage = new Storage();
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const requestBody = req.body;
      // Create a shallow copy of requestBody
      const sanitizedBody = { ...requestBody };
      
      // Delete the image and mask properties
      delete sanitizedBody.image;
      delete sanitizedBody.mask;
      
      // Log the sanitized requestBody
      console.log("Request body without image or mask:", JSON.stringify(sanitizedBody, null, 2));

      //if (requestBody.noCheck === false) {
        const details = await CheckAndSubtractCredits(requestBody.userid, requestBody.ipUser, 1);
        if (details.worked === false) {
          console.log("Credit check failed:", details);
          const status = details.reasonCode === 7 ? 402 : details.reasonCode === 6 ? 403 : 404;
          return res.status(200).json({ status: status, detail: details.reason, thecode: 5001 });
        }
      //}
      console.log("Made it past the credit check.");

      const isInpainting = requestBody.image && requestBody.mask;
      const apiUrl = isInpainting ? "https://api.craftful.ai/geninpaint" : "https://api.craftful.ai/genimage";

      if (isInpainting && requestBody.userEmail) {
        console.log("In inpainting, AND there is an user email... so making the userid the email.");
        requestBody.userid = requestBody.userEmail;
      }

      console.log("API URL being used is:", apiUrl);          

      let response;

      try {
        if (isInpainting) {
          // Handle inpainting request
          let imageBuffer, maskBuffer;

          console.log("Inpainting request detected");

          if (requestBody.image && requestBody.image.startsWith('/api/fetchImage')) {
            const encodedImagePath = requestBody.image.split('imagePath=')[1];
            const decodedImagePath = decodeURIComponent(encodedImagePath);
            const url = new URL(decodedImagePath);
            const imagePath = url.pathname.split('/').slice(2).join('/');
            
            console.log("Attempting to fetch image from path:", imagePath);

            try {
              [imageBuffer] = await storage.bucket('fjusers').file(imagePath).download();
              console.log("Image fetched successfully, buffer length:", imageBuffer.length);
            } catch (error) {
              console.error("Error fetching image:", error);
              return res.status(500).json({ error: "Failed to fetch image data" });
            }
          } else {
            console.log("No image provided for inpainting");
          }

          if (requestBody.mask && requestBody.mask.startsWith('data:image/png;base64,')) {
            maskBuffer = Buffer.from(requestBody.mask.split(',')[1], 'base64');
            console.log("Mask provided, buffer length:", maskBuffer.length);
          } else {
            console.log("No mask provided for inpainting");
          }

          const form = new FormData();

          const appendToForm = (key, value, options = {}) => {
            //console.log(`Attempting to append ${key} to form`);
            //console.log(`Value type: ${typeof value}`);
            //console.log(`Value:`, value);
            try {
              if (options.filename && options.contentType) {
                form.append(key, value, { filename: options.filename, contentType: options.contentType });
              } else {
                form.append(key, value);
              }
              //console.log(`Successfully appended ${key} to form`);
            } catch (error) {
              //console.error(`Error appending ${key} to form:`, error);
              //throw error;
            }
          };
        
          appendToForm('prompt', requestBody.prompt);
          appendToForm('width', requestBody.width);
          appendToForm('height', requestBody.height);
          appendToForm('foldername', requestBody.foldername);
          appendToForm('modelid', requestBody.modelid);
          appendToForm('userid', requestBody.userid);
          appendToForm('negative_prompt', requestBody.negative_prompt);
          appendToForm('seed', requestBody.seed);
          
          if (imageBuffer && imageBuffer.length > 0) {
            console.log("Appending image to form");
            form.append('image', imageBuffer, { filename: 'image.png', contentType: 'image/png' });
          } else {
            console.log("Image buffer is undefined or empty, not appending to form");
          }

          if (maskBuffer && maskBuffer.length > 0) {
            console.log("Appending mask to form");
            form.append('mask', maskBuffer, { filename: 'mask.png', contentType: 'image/png' });
          } else {
            console.log("Mask buffer is undefined or empty, not appending to form");
          }

          console.log("Form data prepared, attempting to send request to:", apiUrl);

          console.log("In inpainting, apiUrl is:", apiUrl);
          console.log("In inpainting, so posting this: ", util.inspect(form, { depth: null }));

          alogger.color('red', 'In inpainting');
          response = await axios.post(apiUrl, form, { headers: {...form.getHeaders(),},
            timeout: 290000
          });

        } else {
          alogger.color('red', 'In regular image generation');

          // Handle genimage request (original method)
          if (requestBody.image && requestBody.image.startsWith('/api/fetchImage')) {
            const encodedImagePath = requestBody.image.split('imagePath=')[1];
            const decodedImagePath = decodeURIComponent(encodedImagePath);
            const url = new URL(decodedImagePath);
            const imagePath = url.pathname.split('/').slice(2).join('/');
            
            try {
              const [fileContents] = await storage.bucket('fjusers').file(imagePath).download();
              requestBody.image = fileContents.toString('base64');
            } catch (error) {
              console.error("Error fetching image:", error);
              return res.status(500).json({ error: "Failed to fetch image data" });
            }
          }

          if (requestBody.userEmail) {
            requestBody.userid = requestBody.userEmail;
          } else {
            console.log("No userEmail, so using the userid as the email");
          }

          try {
            response = await axios.post(apiUrl, requestBody,
               { timeout: 290000 });
          } catch (error) {
            console.error("Error posting to the API:", error);
            return res.status(500).json({ error: "Failed to post to the API" });
          }
        }
        const str = `[${new Date().toISOString()}] Successful API response: ` + JSON.stringify(response.data, null, 2);
        alogger.color('green', str);
        
        //console.log(`[${new Date().toISOString()}] Successful API response:`, response.data);
        res.status(200).json(response.data);
      } catch (apiError) {
        console.log("API request failed:", apiError.message);

        if (apiError.response) {
          console.log("API response status:", apiError.response.status);
          console.log("API response data:", apiError.response.data);
        }
        throw apiError; // Re-throw to be caught by the outer catch block
      }
    } catch (error) {
      console.log("THE REQUEST ERRORED OUT!");
      console.error("Error in /api/generateImage:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        res.status(error.response.status).json({ error: error.response.data });
      } else if (error.request) {
        console.error("No response received:", error.request);
        res.status(500).json({ message: "No response received from the image generation API." });
      } else {
        console.error("Error details:", error.message);
        res.status(500).json({ message: "An error occurred while generating the image." });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function CheckAndSubtractCredits(userID, ipUser, creditsToSubtract) {
  let response;
  let currentCredits;
  let newCredits;

  if (ipUser === true) {  
    console.log("IS a local user, so we're using the ip address to log them in.")
    console.log("CheckAndSubtractCredits --- Ip address User id:", userID);
    try {
      response = await axios.post('https://www.craftful.ai/api/auth/getFreeUserCredits', {
        ipAddress: userID,
      });

      currentCredits = response.data;
      console.log('CheckAndSubtractCredits --- Ip address User credits:', response.data);
    } catch (error) {
      console.error('CheckAndSubtractCredits --- Error getting user credits:', error);
      return { worked: false, reasonCode: 4, reason: "error retrieving ipuser credits" };
    }
 
    if (currentCredits <= 0)
      return { worked: false, reasonCode: 7, reason: "IPUser - Not enough credits for image." };

    try {
      response = await axios.post(`https://www.craftful.ai/api/auth/modifyfreeusercredits`, {
        ipAddress: userID,
        modifyCreditsBy: -creditsToSubtract,
      });

      return true;
    } catch (error) {
      console.error("Error when trying to update user credits with /modifyfreeusercredits." + error);
      return { worked: false, reason: "Error posting to server because of /modifyfreeusercredits." };
    }
  }

  console.log("IS a user with an ACCOUNT, so we're using the user's id to log them in.")

  try {                                
    response = await axios.get(`http://3.19.250.209:36734/user/${userID}`);
    const user = response.data;
    currentCredits = user.credits;
    currentCredits = parseInt(currentCredits);
    newCredits = currentCredits - creditsToSubtract;
    if (newCredits < 0) {
      newCredits = 0;
    }
  } catch (error) {
    console.error("Error retrieving user from database, so treating as if user does not exist" + error);
    return { worked: false, reasonCode: 5, reason: "User doesn't exist." };
  }

  if (currentCredits <= 0) {
    return { worked: false, reasonCode: 6, reason: "Not enough credits for image." };
  }

  console.log("User's id is: ", userID);
  console.log("ok, currentCredits is:", currentCredits, "credits, subtracting:", creditsToSubtract, "credits, for a total of:", newCredits, "credits");

  try {
    const updateResult = await axios.post(`http://3.19.250.209:36734/user/${userID}`, {
      credits: newCredits,
    });
  } catch (error) {
    console.error("Error when trying to update user credits." + error);
    return { worked: false, reason: "Error posting to server." };
  }

  return true;
}

/* Before adding the try/catch to the api call
import axios from 'axios';
import FormData from 'form-data';
import { Storage } from '@google-cloud/storage';
import axiosRetry from 'axios-retry';



// Configure axios-retry
axiosRetry(axios, {
  retries: 3, // number of retries
  retryDelay: axiosRetry.exponentialDelay, // exponential back-off
  retryCondition: (error) => {
    // Retry on any network or 5xx error
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response.status >= 500;
  },
});

// Response size limit is set to 30MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  }
}

let storage;

if (process.env.VERCEL) {
  const serviceAccountKey = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  storage = new Storage({ credentials: serviceAccountKey });
} else {
  storage = new Storage();
}




export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const requestBody = req.body;
      // Create a shallow copy of requestBody
      const sanitizedBody = { ...requestBody };
      
      // Delete the image and mask properties
      delete sanitizedBody.image;
      delete sanitizedBody.mask;
      
      // Log the sanitized requestBody
      console.log("Request body without image or mask:", JSON.stringify(sanitizedBody, null, 2));

      if (requestBody.noCheck === false) {
        const details = await CheckAndSubtractCredits(requestBody.userid, requestBody.ipUser, 1);
        if (details.worked === false) {
          console.log("Credit check failed:", details);
          const status = details.reasonCode === 7 ? 402 : details.reasonCode === 6 ? 403 : 404;
          return res.status(200).json({ status: status, detail: details.reason, thecode: 5001 });
        }
      }
      console.log("Made it past the credit check.");

      const isInpainting = requestBody.image && requestBody.mask;
      const apiUrl = isInpainting ? "https://api.craftful.ai/geninpaint" : "https://api.craftful.ai/genimage";

      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // THIS IS A TEMPORARY FIX FOR THE INPAINTING API UNTIL LUCKY FIXES IT
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      if (isInpainting)
        requestBody.userid = requestBody.userEmail;

      console.log("API URL being used is:", apiUrl);          

      let response;

      if (isInpainting) {
        // Handle inpainting request
        let imageBuffer, maskBuffer;

        if (requestBody.image && requestBody.image.startsWith('/api/fetchImage')) {
          const encodedImagePath = requestBody.image.split('imagePath=')[1];
          const decodedImagePath = decodeURIComponent(encodedImagePath);
          const url = new URL(decodedImagePath);
          const imagePath = url.pathname.split('/').slice(2).join('/');
          
          try {
            [imageBuffer] = await storage.bucket('fjusers').file(imagePath).download();
          } catch (error) {
            console.error("Error fetching image:", error);
            return res.status(500).json({ error: "Failed to fetch image data" });
          }
        }

        if (requestBody.mask && requestBody.mask.startsWith('data:image/png;base64,')) {
          maskBuffer = Buffer.from(requestBody.mask.split(',')[1], 'base64');
        }

        const form = new FormData();
        form.append('prompt', requestBody.prompt);
        form.append('width', requestBody.width);
        form.append('height', requestBody.height);
        form.append('foldername', requestBody.foldername);
        form.append('modelid', requestBody.modelid);
        form.append('userid', requestBody.userid);
        form.append('negative_prompt', requestBody.negative_prompt);
        form.append('seed', requestBody.seed);
        
        if (imageBuffer) {
          form.append('image', imageBuffer, { filename: 'image.png', contentType: 'image/png' });
        }
        if (maskBuffer) {
          form.append('mask', maskBuffer, { filename: 'mask.png', contentType: 'image/png' });
        }

        response = await axios.post(apiUrl, form, {
          headers: {
            ...form.getHeaders(),
          },
        });
      } else {
        // Handle genimage request (original method)
        if (requestBody.image && requestBody.image.startsWith('/api/fetchImage')) {
          const encodedImagePath = requestBody.image.split('imagePath=')[1];
          const decodedImagePath = decodeURIComponent(encodedImagePath);
          const url = new URL(decodedImagePath);
          const imagePath = url.pathname.split('/').slice(2).join('/');
          
          try {
            const [fileContents] = await storage.bucket('fjusers').file(imagePath).download();
            requestBody.image = fileContents.toString('base64');
          } catch (error) {
            console.error("Error fetching image:", error);
            return res.status(500).json({ error: "Failed to fetch image data" });
          }
        }

        if (requestBody.userEmail) {
          requestBody.userid = requestBody.userEmail;
        } else {
          console.log("No userEmail, so using the userid as the email");
        }

        const response = await axios.post(apiUrl, requestBody, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000 // 5 minutes
        });
      }

      console.log(`[${new Date().toISOString()}] Successful API response:`, response.data);
      res.status(200).json(response.data);
    } catch (error) {
      console.log("THE REQUEST ERRORED OUT!");
      console.error("Error in /api/generateImage:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        res.status(error.response.status).json({ error: error.response.data });
      } else if (error.request) {
        console.error("No response received:", error.request);
        res.status(500).json({ message: "No response received from the image generation API." });
      } else {
        console.error("Error details:", error.message);
        res.status(500).json({ message: "An error occurred while generating the image." });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function CheckAndSubtractCredits(userID, ipUser, creditsToSubtract) {
  let response;
  let currentCredits;
  let newCredits;

  if (ipUser === true) {  
    console.log("IS a local user, so we're using the ip address to log them in.")
    console.log("CheckAndSubtractCredits --- Ip address User id:", userID);
    try {
      response = await axios.post('https://www.craftful.ai/api/auth/getFreeUserCredits', {
        ipAddress: userID,
      });

      currentCredits = response.data;
      console.log('CheckAndSubtractCredits --- Ip address User credits:', response.data);
    } catch (error) {
      console.error('CheckAndSubtractCredits --- Error getting user credits:', error);
      return { worked: false, reasonCode: 4, reason: "error retrieving ipuser credits" };
    }
 
    if (currentCredits <= 0)
      return { worked: false, reasonCode: 7, reason: "IPUser - Not enough credits for image." };

    try {
      response = await axios.post(`https://www.craftful.ai/api/auth/modifyfreeusercredits`, {
        ipAddress: userID,
        modifyCreditsBy: -creditsToSubtract,
      });

      return true;
    } catch (error) {
      console.error("Error when trying to update user credits with /modifyfreeusercredits." + error);
      return { worked: false, reason: "Error posting to server because of /modifyfreeusercredits." };
    }
  }

  console.log("IS a user with an ACCOUNT, so we're using the user's id to log them in.")

  try {
    response = await axios.get(`http://3.19.250.209:36734/user/${userID}`);
    const user = response.data;
    currentCredits = user.credits;
    currentCredits = parseInt(currentCredits);
    newCredits = currentCredits - creditsToSubtract;
    if (newCredits < 0) {
      newCredits = 0;
    }
  } catch (error) {
    console.error("Error retrieving user from database, so treating as if user does not exist" + error);
    return { worked: false, reasonCode: 5, reason: "User doesn't exist." };
  }

  if (currentCredits <= 0) {
    return { worked: false, reasonCode: 6, reason: "Not enough credits for image." };
  }

  console.log("User's id is: ", userID);
  console.log("ok, currentCredits is:", currentCredits, "credits, subtracting:", creditsToSubtract, "credits, for a total of:", newCredits, "credits");

  try {
    const updateResult = await axios.post(`http://3.19.250.209:36734/user/${userID}`, {
      credits: newCredits,
    });
  } catch (error) {
    console.error("Error when trying to update user credits." + error);
    return { worked: false, reason: "Error posting to server." };
  }

  return true;
}*/