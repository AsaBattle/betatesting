import { Storage } from '@google-cloud/storage';

export const config = {
  api: {
    responseLimit: false,
  },
};

let storage;

if (process.env.VERCEL) {
  const serviceAccountKey = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  storage = new Storage({ credentials: serviceAccountKey });
} else {
  storage = new Storage();
}

export default async function handler(req, res) {
  const { imagePath } = req.query;
  
  // Extract the actual file path from the fetchImage API URL
  const decodedPath = decodeURIComponent(imagePath);
  const match = decodedPath.match(/imagePath=(.+)$/);
  const actualImagePath = match ? match[1] : null;

  if (!actualImagePath) {
    console.error('Invalid image path');
    return res.status(200).json({ exists: false, message: 'Invalid image path' });
  }

  // Now parse the actual image URL
  const url = new URL(actualImagePath);
  const filePath = url.pathname.split('/').slice(2).join('/');

  console.log('Inside bucketFileExists---- actualImagePath:', actualImagePath);
  console.log('Inside bucketFileExists---- filePath:', filePath);

  try {
    const bucket = storage.bucket('fjusers');
    const file = bucket.file(filePath);
    
    const [exists] = await file.exists();
    
    if (!exists) {
      console.log(`File does not exist yet: ${filePath}`);
      return res.status(200).json({ exists: false, message: 'Image not found' });
    }

    res.status(200).json({ exists: true, message: 'Image exists' });
  } catch (error) {
    console.error('Error checking image in GCS:', error);
    res.status(200).json({ exists: false, message: 'Failed to check image in GCS' });
  }
}