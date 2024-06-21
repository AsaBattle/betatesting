/* Before adding fal
import { parse } from 'cookie';
import axios from 'axios';

const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";
console.log({ API_HOST });

export default async function handler(req, res) {
 
  // Parse the cookies from the request headers
  const cookies = parse(req.headers.cookie || '');

  // Deserialize the user data from the cookie
  const userData = JSON.parse(cookies.user || '{}');

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
}*/

/*
// before adding fal serverless code 
// this code works with replicate just fine
import { parse } from 'cookie';
import axios from 'axios';

const REPLICATE_API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";
const FAL_API_HOST = process.env.FAL_API_HOST || "https://fal.run";

export default async function handler(req, res) {
  // Parse the cookies from the request headers
  const cookies = parse(req.headers.cookie || '');

  // Deserialize the user data from the cookie
  const userData = JSON.parse(cookies.user || '{}');

  const { provider } = req.query;

  let response;

  if (provider === 'replicate') {
    response = await fetch(`${REPLICATE_API_HOST}/v1/predictions/${req.query.id}`, {
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
  else if (provider === 'fal') {
    response = await fetch(`${FAL_API_HOST}/status/${req.query.id}`, {
      headers: {
        Authorization: `Bearer ${process.env.FAL_API_KEY}`,
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

    // Check if the prediction status is "COMPLETED"
    if (prediction.status === "COMPLETED") {
      // Fetch the generated image URL
      const imageResponse = await fetch(`${FAL_API_HOST}/output/${req.query.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.FAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (imageResponse.status !== 200) {
        let error = await imageResponse.json();
        res.statusCode = 500;
        res.end(JSON.stringify({ detail: error.detail }));
        return;
      }

      const imageData = await imageResponse.json();
      prediction.output = [imageData.url]; // Assign the image URL to the output array
    }

    res.end(JSON.stringify(prediction));
  } else {
    res.statusCode = 400;
    res.end(JSON.stringify({ detail: "Invalid provider specified" }));
  }
}
*/  

/*
import { parse } from 'cookie';
import fal from "../../../lib/fal.js";

const REPLICATE_API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";

export default async function handler(req, res) {
  // Parse the cookies from the request headers
  const cookies = parse(req.headers.cookie || '');

  // Deserialize the user data from the cookie
  const userData = JSON.parse(cookies.user || '{}');

  const { provider } = req.query;

  let response;

  if (provider === 'replicate') {
    response = await fetch(`${REPLICATE_API_HOST}/v1/predictions/${req.query.id}`, {
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
  } else if (provider === 'fal') {
    try {
      const predictionId = req.query.id;
      response = await fal.status(predictionId);
  
      const prediction = response;
      prediction.theuser = userData;
  
      if (prediction.status === "COMPLETED") {
        const output = await fal.output(predictionId);
        prediction.output = output.images;
      }
  
      res.end(JSON.stringify(prediction));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: error.message }));
    }
  } else {
    res.statusCode = 400;
    res.end(JSON.stringify({ detail: "Invalid provider specified" }));
  }
}*/

import { parse } from 'cookie';
import fal from "../../../lib/fal.js";

const REPLICATE_API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";
const FAL_API_HOST = process.env.FAL_API_HOST || "https://fal.run";

export default async function handler(req, res) {
  // Parse the cookies from the request headers
  const cookies = parse(req.headers.cookie || '');

  // Deserialize the user data from the cookie
  const userData = JSON.parse(cookies.user || '{}');

  const { provider } = req.query;

  let response;

  if (provider === 'replicate') {
    response = await fetch(`${REPLICATE_API_HOST}/v1/predictions/${req.query.id}`, {
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
  else if (provider === 'fal') {
    try {
      const predictionId = req.query.id;
      response = await fal.status(predictionId);
  
      const prediction = response;
      prediction.theuser = userData;
  
      if (prediction.status === "COMPLETED") {
        const output = await fal.output(predictionId);
        prediction.output = output.images;
      }
  
      res.end(JSON.stringify(prediction));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: error.message }));
    }
  } else {
    res.statusCode = 400;
    res.end(JSON.stringify({ detail: "Invalid provider specified" }));
  }
}
  