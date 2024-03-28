import { parse } from 'cookie';
import axios from 'axios';

const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";
const addBackgroundToPNG = require("lib/add-background-to-png");


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  },
}


export default async function handler(req, res) {
  let cookies, userData, details;

  // Only check credits if we're on the server
  if (process.env.NEXT_PUBLIC_WORKING_LOCALLY === 'false') {
    // Parse the cookies from the request headers
    cookies = parse(req.headers.cookie || '');

    // Deserialize the user data from the cookie
    userData = JSON.parse(cookies.user || '{}');

    //console.log("req.body.userId
/*
    // Now check to make sure the user has the necessary credits to make a prediction
    details = await CheckAndSubtractCredits(userData, req.body.userId, 1);
    if (details.worked === false && reasonCode === 6) {
      res.statusCode = 403;
      res.end(JSON.stringify({ detail: details.reason, thecode: 5001 }));
      return;
    } else
    if (details.worked === false && reasonCode === 5) {
      res.statusCode = 404
      res.end(JSON.stringify({ detail: details.reason, thecode: 5001 }));
      return;
  }
  */
  } 
  // remnove null and undefined values
  req.body = Object.entries(req.body).reduce(
    (a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
    {}
  );

  const body = JSON.stringify({
    // Pinned to a specific version of Stable Diffusion, fetched from:
    // https://replicate.com/stability-ai/stable-diffusion
    // This one(startes with 1c7d4c8d) is using DALLE
    
    //version: "1c7d4c8dec39c7306df7794b28419078cb9d18b9213ab1c21fdc46a1deca0144",  // Dalle
    version: "9ebea41ac69a3256f71d8b4f80efe6f0dc719f8be70888d6b481e06258a2ee96", // Dreamshaper version
    input: { 
      ...req.body, // Spread the properties of req.body here
      disable_safety_checker: true,
      num_inference_steps: 6,
      apply_watermark: false,
      scheduler: "K_EULER_ANCESTRAL", // old one was "DDIM", // Add the scheduler property
    },
  });
  


  const response = await fetch(`${API_HOST}/v1/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (response.status !== 201) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return; 
  }

  const prediction = await response.json();
  prediction.theuser = userData;

  res.statusCode = 201;
  res.end(JSON.stringify(prediction));
}



async function CheckAndSubtractCredits(userData, userUUID, creditsToSubtract) {
  let response;
  let currentCredits;
  let newCredits;

  // grab the user's current credits(userData has only the initial call to the server when the user logged in so it's not updated)
  try {
    response = await axios.get(`http://3.19.250.209:36734/user/${userData.user_id}`);
    const user = response.data;
    currentCredits = user.credits;
    currentCredits = parseInt(currentCredits);
    newCredits = currentCredits - creditsToSubtract;
  } catch (error) {

    // Until Lucky adds specific error messages we treat an error as meaning the user doesn't exist
    console.error("Error retrieving user from database, so treating as if user does not exist" +error);
    return  {worked: false, reasonCode: 5, reason: "User doesn't exist."};
  }

  if (newCredits < 0) {
    return {worked: false, reason: "Not enough credits for image."};
  }

  console.log("UserData is: ", userData);
  console.log("ok, currentCredits is:", currentCredits, "credits, subtracting:", creditsToSubtract, "credits, for a total of:", newCredits, "credits");


  // Now update the user's credits
  try {
    const updateResult = await axios.post(`http://3.19.250.209:36734/user/${userData.user_id}`, {
      credits: newCredits,
    });
  } catch (error) {
    console.error("Error when trying to update user credits." +error);
    return  {worked: false, reason: "Error posting to server."};
  }

  return true;
}