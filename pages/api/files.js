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
  if (req.method === 'GET') {
    const { userId } = req.query;

    try {
      const bucket = storage.bucket('fjusers');
      //const [files] = await bucket.getFiles({ prefix: `${userId}/` });
      const [files] = await bucket.getFiles({ prefix: `anon/` });
      
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
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