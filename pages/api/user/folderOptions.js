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


// a list of the various actions that can be performed on a folder
const folderActions = {
  delete: 'delete',
  rename: 'rename',
  copy: 'copy',
  move: 'move',
  createFolder: 'createFolder',
};

const change = true;

 // WORK ON THIS NEXT ASA !!! new create folder option is making a file and not a folder
export default async function handler(req, res) {
    if (req.method === 'POST') {
        // grab the userId and folderAction and all the other possible data that could be passed in such as folderPath, newFolderPath, sourceFolderPath, destinationFolderPath
        const { userId, folderAction, folderPath, oldFolderPath, newFolderPath, sourceFolderPath, destinationFolderPath } = req.body;
    
        console.log('Inside folder options for:', userId);
        try {
            const bucket = storage.bucket('fjusers');
    
            // now based on the folderAction passed in, we will do the appropriate action
            switch (folderAction) {
              case folderActions.delete:
                console.log('Deleting folder:', folderPath);
                const folder = bucket.file(`${userId}/${folderPath}`);
                await folder.delete();
                break;
              case folderActions.rename:
                console.log('Renaming folder:', oldFolderPath, 'to', newFolderPath);
                const oldFolder = bucket.file(`${userId}/${oldFolderPath}`);
                const newFolder = bucket.file(`${userId}/${newFolderPath}`);
                await oldFolder.move(newFolder);
                break;
              case folderActions.copy:
                const sourceFolder = bucket.file(`${userId}/${sourceFolderPath}`);
                const destinationFolder = bucket.file(`${userId}/${destinationFolderPath}`);
                await sourceFolder.copy(destinationFolder);
                break;
              case folderActions.move:
                console.log('Moving folder:', sourceFolderPath, 'to', destinationFolderPath);
                const sourceFolder2 = bucket.file(`${userId}/${sourceFolderPath}`);
                const destinationFolder2 = bucket.file(`${userId}/${destinationFolderPath}`);
                await sourceFolder2.move(destinationFolder2);
                break;
              case folderActions.createFolder: 
                console.log('Creating folder:', newFolderPath);
                const newFolder2 = bucket.file(`${userId}/${newFolderPath}`);
                await newFolder2.save('');
                break;
              default:
                console.error('Unknown folder action:', folderAction);
                res.status(400).json({ error: 'Unknown folder action' });
                return;
            }
    
            console.log('Action completed successfully');
          res.status(200).json({ message: 'Action completed successfully' });
            
        } catch (error) {
          console.error('Error performing folder action:', error);
          res.status(500).json({ error: 'Failed to perform folder action' });
        }
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
}
