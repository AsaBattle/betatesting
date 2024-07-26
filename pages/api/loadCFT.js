/*
The CFT file is a JSON object file that contains the following fields:
    - prompt: the prompt that was used to generate the image
    - negative_prompt: the negative prompt that was used to generate the image
    - model: the model that was used to generate the image
*/

import { Storage } from '@google-cloud/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  }
};

let storage;

if (process.env.VERCEL) {
  // Running on Vercel
  const serviceAccountKey = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  storage = new Storage({ credentials: serviceAccountKey });
} else {
  // Running locally
  storage = new Storage();
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, fileAndPath } = req.body;

    const genericCFTData = {
        prompt: 'No prompt data found for this image',
        negative_prompt: 'default',
        model: 1, // default model, defaulting to 1 because it's much faster to produce than 0
    };
    
    try {
      console.log("Attempting to load the .cft file for the image:", `${userId}/${fileAndPath}`);
      const bucket = storage.bucket('fjusers');
      const file = bucket.file(`${userId}/${fileAndPath}.cft`);

      const [exists] = await file.exists();
      if (!exists) {
        console.log('.cft file not found for user ' + userId + ' and file ' + fileAndPath);
        console.log('Returning generic CFT data...');
        return res.status(200).json(genericCFTData);
      }

      const [contents] = await file.download();
      console.log("Raw file contents:", contents.toString());

      const cftData = JSON.parse(contents.toString());

      console.log("Parsed cft data:", cftData);
      console.log("---prompt: ", cftData.prompt);
      console.log("---model: ", cftData.model);

      res.status(200).json(cftData);
    } catch (error) {
      console.error('Error loading .cft file:', error);
      res.status(500).json(genericCFTData);
    }
  } else {
    res.status(405).json({ message: 'Thank you' });
  }
}