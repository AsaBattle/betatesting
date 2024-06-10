// storageUtil.js
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

async function uploadImage(bucketName, fileName, fileContent) {
  const file = storage.bucket(bucketName).file(fileName);
  await file.save(fileContent, {
    metadata: {
      contentType: 'image/jpeg',
    },
  });
  console.log(`Image ${fileName} uploaded successfully to bucket ${bucketName}.`);
}

module.exports = {
  uploadImage,
};