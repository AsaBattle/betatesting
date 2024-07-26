import { Storage } from '@google-cloud/storage';
import sizeOf from 'image-size';

export const config = {
    api: {
      bodyParser: {
        sizeLimit: '30mb',
      },
    }
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
  return new Promise((resolve, reject) => {
    file.createReadStream()
      .on('error', reject)
      .pipe(sizeOf((err, dimensions) => {
        if (err) {
          console.error(`Error processing file ${file.name}:`, err);
          resolve({ width: 0, height: 0 });
        } else {
          resolve(dimensions);
        }
      }));
  });
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
            expires: Date.now() + 100 * 365 * 24 * 60 * 60 * 1, // URL expires in 1 year
          });

         // const { width, height } = await getImageDimensions(file);

          return {
            name: file.name,
            url,
           // width,
           // height,
          };
        })
      );

      res.status(200).json({ files: fileDetails });
    } catch (error) {
      console.error('Error retrieving files:', error);
      res.status(500).json({ error: 'Failed to retrieve files' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}