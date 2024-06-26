import { Storage } from '@google-cloud/storage';

export const config = {
  api: {
    //responseLimit: false,
    sizeLimit: '30mb',  //
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
  
  const url = new URL(imagePath);
  const filePath = url.pathname.split('/').slice(2).join('/');

  console.log('Inside fetchImage---- imagePath:', imagePath);
  console.log('Inside fetchImage---- filePath:', filePath);

  try {
    const bucket = storage.bucket('fjusers');
    const file = bucket.file(filePath);
    
    const [exists] = await file.exists();
    
    if (!exists) {
      console.error(`File does not exist: ${filePath}`);
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