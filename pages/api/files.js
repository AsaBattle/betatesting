import { Storage } from '@google-cloud/storage';
import sizeOf from 'image-size';
import { size } from 'lodash';

export const config = {
    api: {
      bodyParser: {
        sizeLimit: '30mb',
      },
    }
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

const calculateAspectRatio = (width, height) => {
  const aspectRatios = {
    '1:1': 1, '16:9': 16/9, '9:16': 9/16, '4:3': 4/3, '3:4': 3/4
  };
  let closestRatio = '1:1';
  let smallestDiff = Infinity;
  const imageRatio = width / height;
  
  Object.entries(aspectRatios).forEach(([name, ratio]) => {
    const diff = Math.abs(ratio - imageRatio);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestRatio = name;
    }
  });
  
  return closestRatio;
};

async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const readStream = file.createReadStream({start: 0, end: 23}); // Read only the first 24 bytes
    let buffer = Buffer.alloc(24);
    let bytesRead = 0;

    readStream.on('data', (chunk) => {
      bytesRead += chunk.copy(buffer, bytesRead);
      if (bytesRead >= 24) {
        readStream.destroy(); // Stop reading after we have the first 24 bytes
        
        let width, height;

        // Check for PNG
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
          width = buffer.readUInt32BE(16);
          height = buffer.readUInt32BE(20);
        } 
        // Check for GIF
        else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
          width = buffer.readUInt16LE(6);
          height = buffer.readUInt16LE(8);
        }
        // For JPEG, we need to read more data
        else if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
          readJPEGDimensions(file).then(dimensions => {
            const aspectRatio = calculateAspectRatio(dimensions.width, dimensions.height);
            resolve({ ...dimensions, aspectRatio });
          }).catch(reject);
          return;
        }

        if (width && height) {
          const aspectRatio = calculateAspectRatio(width, height);
          resolve({ width, height, aspectRatio });
        } else {
          console.warn(`Could not determine dimensions for file: ${file.name}`);
          resolve({ width: 0, height: 0, aspectRatio: '1:1' });
        }
      }
    });

    readStream.on('error', (error) => {
      console.error(`Error reading file ${file.name}:`, error);
      reject(error);
    });
  });
}

async function readJPEGDimensions(file) {
  return new Promise((resolve, reject) => {
    const readStream = file.createReadStream();
    let buffer = Buffer.alloc(512); // Larger buffer for JPEG
    let bytesRead = 0;

    readStream.on('data', (chunk) => {
      bytesRead += chunk.copy(buffer, bytesRead);
      
      let pos = 0;
      while (pos < bytesRead - 1) {
        if (buffer[pos] === 0xFF && buffer[pos + 1] === 0xC0) {
          readStream.destroy();
          const height = buffer.readUInt16BE(pos + 5);
          const width = buffer.readUInt16BE(pos + 7);
          return resolve({ width, height });
        }
        pos++;
      }

      if (bytesRead >= buffer.length) {
        // If we've read the entire buffer and haven't found the dimensions,
        // shift the buffer and continue reading
        buffer.copy(buffer, 0, buffer.length / 2);
        bytesRead = buffer.length / 2;
      }
    });

    readStream.on('end', () => {
      console.warn(`Could not determine dimensions for JPEG file: ${file.name}`);
      resolve({ width: 0, height: 0 });
    });

    readStream.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {userId, folder} = req.body;

    console.log('Inside files.js---- userId:', userId);
    console.log('Inside files.js---- folders:', folder);

    try {
      const bucket = storage.bucket('fjusers');
      const [allFiles] = await bucket.getFiles({ prefix: `${userId}/${folder}` });
      const files = allFiles.filter(file => file.name.endsWith('.jpg') || file.name.endsWith('.png'));
      
     // console.log('Files:', files);

     console.log("Inside files.js----");

      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 100 * 365 * 24 * 60 * 60 * 1, // URL expires in 1 year
          });
   
          const { width, height, aspectRatio } = await getImageDimensions(file);
          const [metadata] = await file.getMetadata();


          console.log('Got file details:', file.name, width, height);
          console.log('with Metadata:', metadata);

          return {
            name: file.name,
            url,
            width,
            height,
            aspectRatio,
            size: metadata.size,
            date: metadata.timeCreated,
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