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
  if (req.method === 'POST') {

    const {userId,folder} = req.body;

    console.log('Inside files.js---- userId:', userId);
    console.log('Inside files.js---- folders:', folder);

    try {
      const bucket = storage.bucket('fjusers');
      const [files] = await bucket.getFiles({ prefix: `${userId}/${folder}` });
      //const [files] = await bucket.getFiles({ prefix: `anon/` });
      
      console.log('Files:', files);

      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 100 * 365 * 24 * 60 * 60 * 1, // URL expires in 1 years
          });

          return {
            name: file.name,
            url,
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