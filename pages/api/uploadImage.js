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
        const { bucketName, fileName, fileContent } = req.body;
    
        try {
          const file = storage.bucket(bucketName).file(fileName);
    
          // Decode base64 file content
          const buffer = Buffer.from(fileContent, 'base64');
    
          await file.save(buffer, {
            metadata: {
              contentType: 'image/jpeg',
            },
          });
    
          res.status(200).json({ message: 'Image uploaded successfully' });
        } catch (error) {
          console.error('Error uploading image to Google Cloud Storage:', error);
          res.status(500).json({ message: 'Failed to upload the image' });
        }
      } else {
        res.status(405).json({ message: 'Method Not Allowed' });
      }
}