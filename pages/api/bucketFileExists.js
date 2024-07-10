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
  
  if (!imagePath) {
    console.error('Invalid image path');
    return res.status(400).json({ exists: false, message: 'Invalid image path' });
  }

  // Decode the URL-encoded imagePath
  const decodedPath = decodeURIComponent(imagePath);
  console.log('Inside bucketFileExists---- imagePath:', imagePath);
  console.log('Inside bucketFileExists---- decodedPath:', decodedPath);

  let finalPath;

  if (decodedPath.includes('/api/fetchImage?imagePath=')) {
    // Handle nested fetchImage case
    const match = decodedPath.match(/imagePath=(.+)$/);
    if (match) {
      const nestedPath = decodeURIComponent(match[1]);
      if (nestedPath.startsWith('https://storage.googleapis.com/fjusers/')) {
        finalPath = nestedPath.replace('https://storage.googleapis.com/fjusers/', '');
      } else {
        finalPath = nestedPath;
      }
    }
  } else if (decodedPath.startsWith('https://storage.googleapis.com/fjusers/')) {
    // Handle direct GCS URL case
    finalPath = decodedPath.replace('https://storage.googleapis.com/fjusers/', '');
  } else {
    // Handle simple path case
    finalPath = decodedPath;
  }

  console.log('Inside bucketFileExists---- finalPath:', finalPath);

  if (!finalPath) {
    console.error('Could not extract valid file path');
    return res.status(400).json({ exists: false, message: 'Invalid file path' });
  }

  try {
    const bucket = storage.bucket('fjusers');
    const file = bucket.file(finalPath);
    
    const [exists] = await file.exists();
    
    if (!exists) {
      console.log(`File does not exist yet: ${finalPath}`);
      return res.status(200).json({ exists: false, message: 'Image not found' });
    }

    res.status(200).json({ exists: true, message: 'Image exists' });
  } catch (error) {
    console.error('Error checking image in GCS:', error);
    res.status(500).json({ exists: false, message: 'Failed to check image in GCS' });
  }
}