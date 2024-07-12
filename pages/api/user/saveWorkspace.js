// JUST FINISHED GERTTING THE SAVEWORKSPACE TO AUTO SAVE WHEN THE USER NAVIGATES AWAY FROM THE PAGE
// NOW WE GOTTA ACTUALLY MAKE IT SAVE THE PREDICTIONS IMAGES AND THEN PROPERLY LOAD THEM BACK IN WHEN THE USER RETURNS

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
    const { userId, ...workspaceData } = req.body;

    if (!userId){
      console.error('No userId provided. Cannot save workspace.');
      return;
    }

    try {
      console.log("Attempting to save workspace for user:", userId);
      const bucket = storage.bucket('fjusers');
      const file = bucket.file(`${userId}/fjuserworkspace.dat`);

      const saveData = JSON.stringify(workspaceData);
      await file.save(saveData);

      console.log("Userid is:", userId)
      console.log('Workspace saved successfully, data saved to:', `${userId}/fjuserworkspace.dat`);
      console.log('Data saved was:', saveData);
      res.status(200).json({ message: 'Workspace saved successfully' });
    } catch (error) {
      console.error('Error saving workspace:', error);
      res.status(500).json({ message: 'Error saving workspace', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}