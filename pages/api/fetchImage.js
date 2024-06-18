import { Storage } from '@google-cloud/storage';


export const config = {
    api: {
      bodyParser: {
        sizeLimit: '30mb',
      },
    },
  }

const storage = new Storage();

export default async function handler(req, res) {
  const { imagePath } = req.query;

  try {
    const file = storage.bucket('fjusers').file(imagePath);
    const [metadata] = await file.getMetadata();
    const [contents] = await file.download();

    res.setHeader('Content-Type', metadata.contentType);
    res.send(contents);
  } catch (error) {
    console.error('Error fetching image from GCS:', error);
    res.status(500).json({ message: 'Failed to fetch image from GCS' });
  }
}
