
// pages/api/loadWorkspace.js
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
  if (req.method !== 'POST') {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.body;

  const storage = new Storage();
  const bucket = storage.bucket('fjusers');
  const file = bucket.file(`${userId}/fjuserworkspace.dat`);

  console.log("Inside loadWorkspace for user: ", userId, " attempting to load workspace file: ", `${userId}/fjuserworkspace.dat`)
  try {
    const [contents] = await file.download();
    const workspaceData = JSON.parse(contents.toString());
    console.log("Loaded workspace data: ", workspaceData);
    res.status(200).json(workspaceData);
  } catch (error) {
    console.error('Error loading workspace:', error);
    res.status(500).json({ message: 'Error loading workspace' });
  }
}