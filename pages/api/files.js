import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export const config = {
    api: {
      bodyParser: {
        sizeLimit: '30mb',
      },
    },
  }

let storage;

if (process.env.VERCEL) {
  // Running on Vercel
  const serviceAccountKey = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  storage = new Storage({ credentials: serviceAccountKey });
} else {
  // Running locally
  storage = new Storage();
}

const calculateAspectRatio = (width, height) => {
  const aspectRatios = {
    '1:1': 1, '16:9': 16/9, '9:16': 9/16, '4:3': 4/3, '3:4': 3/4
  };
  let closestRatio = '1:1';
  let smallestDiff = Infinity;
  const imageRatio = width / height;
  
  Object.entries(aspectRatios).forEach(([name, ratio]) => {
    const diff = Math.abs(ratio - imageRatio);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestRatio = name;
    }
  });
  
  return closestRatio;
};

async function getImageDimensions(file) {
  const tempFilePath = path.join(os.tmpdir(), file.name);
  try {
    await file.download({ destination: tempFilePath });
    const metadata = await sharp(tempFilePath).metadata();
    await fs.unlink(tempFilePath);
    return { width: metadata.width, height: metadata.height };
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    return { width: 0, height: 0 };
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {userId, folder} = req.body;

    console.log('Inside files.js---- userId:', userId);
    console.log('Inside files.js---- folders:', folder);

    try {
      const bucket = storage.bucket('fjusers');
      const [files] = await bucket.getFiles({ prefix: `${userId}/${folder}` });
      
      console.log('Files:', files);

      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 100 * 365 * 24 * 60 * 60 * 1, // URL expires in 1 years
          });

          const { width, height } = await getImageDimensions(file);

          return {
            name: file.name,
            url,
            width,
            height,
          };
        })
      );

      res.status(200).json({ files: fileDetails });
    } catch (error) {
      console.error('Error retrieving files:', error);
      res.status(500).json({ error: 'Failed to retrieve files' });
    }
  } else {
    console.log("received a non-POST request of type: ", req.method);
    res.status(405).json({ error: 'Method not allowed' });
  }
}