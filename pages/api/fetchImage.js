import { Storage } from '@google-cloud/storage';


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

export default async function handler(req, res) {
  const { imagePath } = req.query;

    console.log('Inside fetchImage---- imagePath:', imagePath);

  try {
    const file = storage.bucket('fjusers').file(imagePath);
    const [metadata] = await file.getMetadata();
    const [contents] = await file.download();

    res.setHeader('Content-Type', metadata.contentType);
    res.send(contents);
    console.log('I got the image!');
  } catch (error) {
    console.error('Error fetching image from GCS:', error);
    res.status(500).json({ message: 'Failed to fetch image from GCS' });
  }
}