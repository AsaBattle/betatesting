/*
This component is responsible for saving and loading the workspace, using the user GCS bucket as a receptacle for the workspace files.
The user's workspace is saved in the GCS bucket with the user's email as their folder name and fjuserworkpspace.dat as the file name.
The workspace is saved as a JSON object containing the following fields:
- Current image save path(just the name of the folder where the images are saved in the bucket)
- List of gcs bucket files currently being worked on

This component will support the followind functionality:
- Save workspace
- Load workspace
*/

