import { Storage } from '@google-cloud/storage';

export const config = {
  api: {
    sizeLimit: '30mb',
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
  
  // Decode the imagePath
  const decodedPath = decodeURIComponent(imagePath);

  console.log('Inside fetchImage---- imagePath:', imagePath);
  console.log('Inside fetchImage---- decodedPath:', decodedPath);

  // Function to clean the path
  const cleanPath = (path) => {
    const parts = path.split('/');
    const fjusersIndex = parts.findIndex(part => part === 'fjusers');
    if (fjusersIndex !== -1) {
      return parts.slice(fjusersIndex + 1).join('/');
    }
    return path;
  };

  const finalPath = cleanPath(decodedPath);
  console.log('Inside fetchImage---- finalPath:', finalPath);

  try {
    const bucket = storage.bucket('fjusers');
    const file = bucket.file(finalPath);
    
    const [exists] = await file.exists();
    
    if (!exists) {
      console.error(`File does not exist: ${finalPath}`);
      return res.status(404).json({ message: 'Image not found' });
    }

    const [fileContents] = await file.download();
    const [metadata] = await file.getMetadata();

    res.setHeader('Content-Type', metadata.contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.write(fileContents);
    res.end(); // Explicitly end the response
  } catch (error) {
    console.error('Error fetching image from GCS:', error);
    res.status(500).json({ message: 'Failed to fetch image from GCS' });
  }
}