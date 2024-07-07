import axios from 'axios';
import FormData from 'form-data';
import { Storage } from '@google-cloud/storage';

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

        response = await axios.post(apiUrl, requestBody, {
          headers: {
            'Content-Type': 'application/json',
          },
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
}