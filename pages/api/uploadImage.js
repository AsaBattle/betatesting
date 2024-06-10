import { Storage } from '@google-cloud/storage';

const storage = new Storage();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { bucketName, fileName, fileContent } = req.body;

    try {
      const file = storage.bucket(bucketName).file(fileName);
      await file.save(fileContent, {
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