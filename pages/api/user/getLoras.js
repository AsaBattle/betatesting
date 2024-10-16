import { Storage } from '@google-cloud/storage';
import axios from 'axios';

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
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    const { userId } = req.body;
  
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      const response = await axios.get(`https://3.19.250.209:36734/getloras/${userId}`);
      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching LoRas:', error);
      return res.status(500).json({ message: 'Error fetching LoRas', error: error.message });
    }
  }