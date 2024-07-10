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

  // Extract the actual file path from the nested fetchImage API URL
  const match = decodedPath.match(/imagePath=(.+)$/);
  const actualImagePath = match ? match[1] : decodedPath;

  // Further decode the actualImagePath to handle any remaining URL encoding
  const fullyDecodedPath = decodeURIComponent(actualImagePath);

  console.log('Inside bucketFileExists---- imagePath:', imagePath);
  console.log('Inside bucketFileExists---- actualImagePath:', actualImagePath);
  console.log('Inside bucketFileExists---- fullyDecodedPath:', fullyDecodedPath);

  // Split the path into user email and file path
  const [userEmail, ...fileParts] = fullyDecodedPath.split('/');
  const filePath = fileParts.join('/');

  try {
    const bucket = storage.bucket('fjusers');
    const file = bucket.file(`${userEmail}/${filePath}`);
    
    const [exists] = await file.exists();
    
    if (!exists) {
      console.log(`File does not exist yet: ${userEmail}/${filePath}`);
      return res.status(200).json({ exists: false, message: 'Image not found' });
    }

    res.status(200).json({ exists: true, message: 'Image exists' });
  } catch (error) {
    console.error('Error checking image in GCS:', error);
    res.status(500).json({ exists: false, message: 'Failed to check image in GCS' });
  }
}