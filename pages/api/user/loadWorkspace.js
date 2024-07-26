import { Storage } from '@google-cloud/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  }
};

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
    const { userId } = req.body;

    try {
      console.log("Attempting to load workspace from bucket path:", `${userId}/fjuserworkspace.dat`);
      const bucket = storage.bucket('fjusers');
      const file = bucket.file(`${userId}/fjuserworkspace.dat`);

      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ message: 'Workspace file not found' });
      }

      const [contents] = await file.download();
      console.log("Raw file contents:", contents.toString());

      const workspaceData = JSON.parse(contents.toString());

      console.log("Parsed workspace data:", workspaceData);
      console.log("imageSavePath:", workspaceData.imageSavePath);
      console.log("currentFiles:", workspaceData.currentFiles);
      res.status(200).json(workspaceData);
    } catch (error) {
      console.error('Error loading workspace:', error);
      res.status(500).json({ message: 'Error loading workspace', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Thank you' });
  }
}