// POST
//www.craftful.ai/genimage/
// prompt, negative_prompt, modelid=0, seed(optional), userid, width, height
// geninpaint
// also send mask, image
// filename in return 
import axios from 'axios';
import { parse } from 'cookie';
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
      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      // Check credits
      const details = await CheckAndSubtractCredits(requestBody.userid, requestBody.ipUser, 1);
      if (details.worked === false) {
        console.log("Credit check failed:", details);
        const status = details.reasonCode === 7 ? 402 : details.reasonCode === 6 ? 403 : 404;
        return res.status(200).json({ status: status, detail: details.reason, thecode: 5001 });
      }
      console.log("Made it past the credit check.");

      // Fetch the image data if it's a URL to our fetchImage route
      if (requestBody.image && requestBody.image.startsWith('/api/fetchImage')) {
        const imagePath = new URL(requestBody.image.split('imagePath=')[1]).pathname.slice(1);
        const [fileContents] = await storage.bucket('fjusers').file(imagePath).download();
        requestBody.image = fileContents.toString('base64');
      }



      // copy email to userid, so that the post image generation request saves the image in the correct user folder
      if (requestBody.userEmail)
        requestBody.userid = requestBody.userEmail;
      else
        {
          console.log("No userEmail, so using the userid as the email");
        }
      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      // Make the API request
      const apiUrl = requestBody.image && requestBody.mask 
        ? "https://api.craftful.ai/geninpaint" 
        : "https://api.craftful.ai/genimage";

      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authentication headers here
        },
      });
console.log(`[${new Date().toISOString()}] Successful API response:`, response.data);
      res.status(200).json(response.data);
    } catch (error) {
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





// userID is the id used to log the user into...
// if ipUser = true, then we're using the user's ip address to log them in and using that database
// if ipUser = false, then we're using the user's id to log them in and using the main database
async function CheckAndSubtractCredits(userID, ipUser, creditsToSubtract) {
    let response;
    let currentCredits;
    let newCredits;
  
    // If the user is logged in via ip(since they don't have an account yet)
    if (ipUser === true) {  
      console.log("IS a local user, so we're using the ip address to log them in.")
      // grab the user's current credits
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
  
    // grab the user's current credits(userData has only the initial call to the server when the user logged in so it's not updated)
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
      // Until Lucky adds specific error messages we treat an error as meaning the user doesn't exist
      console.error("Error retrieving user from database, so treating as if user does not exist" + error);
      return { worked: false, reasonCode: 5, reason: "User doesn't exist." };
    }
  
    if (currentCredits <= 0) {
      return { worked: false, reasonCode: 6, reason: "Not enough credits for image." };
    }
  
    console.log("User's id is: ", userID);
    console.log("ok, currentCredits is:", currentCredits, "credits, subtracting:", creditsToSubtract, "credits, for a total of:", newCredits, "credits");
  
    // Now update the user's credits
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
  