// pages/api/saveWorkspace.js
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

  // We dont' want to save the userId in the workspace file
  delete req.body.userId;

  try {
    const saveData = JSON.stringify(req.body);
    await file.save(saveData); // Save all attributes from req.body
    console.log('Workspace saved successfully, data saved to ' + `${userId}/fjuserworkspace.dat`);
    console.log('Data saved was: ', saveData);
    res.status(200).json({ message: 'Workspace saved successfully' });
  } catch (error) {
    console.error('Error saving workspace:', error);
    res.status(500).json({ message: 'Error saving workspace' });
  }
}