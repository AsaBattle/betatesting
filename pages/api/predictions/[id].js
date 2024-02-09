import { parse } from 'cookie';
import { axios } from 'axios';

const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";
console.log({ API_HOST });

export default async function handler(req, res) {
 
  // Parse the cookies from the request headers
  const cookies = parse(req.headers.cookie || '');

  // Deserialize the user data from the cookie
  const userData = JSON.parse(cookies.user || '{}');

  // Now check to make sure the user has the necessary credits to make a prediction
  let details = await CheckAndSubtractCredits(userData, 1);
  if (details.worked === false) {
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: details.reason }));
      return;
    }


  const response = await fetch(`${API_HOST}/v1/predictions/${req.query.id}`, {
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  
  if (response.status !== 200) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  const prediction = await response.json();
  prediction.theuser = userData;
  res.end(JSON.stringify(prediction));
}



async function CheckAndSubtractCredits(userData, creditsToSubtract) {
  let currentCredits = userData.credits;
  let newCredits;
  currentCredits = parseInt(currentCredits);
  newCredits = currentCredits - creditsToSubtract;
  if (newCredits < 0) {
    return {worked: false, reason: "Not enough credits for image."};
  }

  console.log("UserData is: ", userData);
  
  // Now update the user's credits
  try {
    const updateResult = await axios.post(`http://3.19.250.209:36734/user/${userData.user_id}`, {
      credits: newCredits.toString(),
    });
  } catch (error) {
    console.error("Error when trying to update user credits." +error);
    return  {worked: false, reason: "Error posting to server."};
  }

  return true;
}


/*
 try {
        response = await axios.get(`http://`+MrLuckysIP()+`/user/${paymentIntent.metadata.userId}`);
        const user = response.data;
        let currentCredits = user.credits;
        let newCredits;
        
          currentCredits = parseInt(currentCredits);
          newCredits = currentCredits + parseInt(PackageNameToCredits(paymentIntent.metadata.tierType));

        console.log("User currently has:", currentCredits, "credits, adding:", PackageNameToCredits(paymentIntent.metadata.tierType), "credits, for a total of:", newCredits, "credits");

        try{
          const updateResult = await axios.post(`http://`+MrLuckysIP()+`/user/${paymentIntent.metadata.userId}`, {
          credits: newCredits.toString(),
        });
      } catch (error) {
        console.error("1Error when trying to update user credits." +error);
          res.status(500);
          return res.json({received: true});
        }
*/