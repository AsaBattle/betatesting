/*
This component is responsible for saving and loading the workspace, using the user GCS bucket as a receptacle for the workspace files.
The user's workspace is saved in the GCS bucket with the user's email as their folder name and fjuserworkpspace.dat as the file name.
The workspace is saved as a JSON object containing the following fields:
- Current image save path(just the name of the folder where the images are saved in the bucket)
- List of gcs bucket files currently being worked on

This component will support the following functionality:
- Save workspace
- Load workspace
*/

// First I'll make a component that runs a function named saveWorkspace which will be called when the user clicks the save button or
// when the user logs out, closes the browser or navigates away from the page. This function will save the workspace to the user's
// GCS bucket. This component will be called WorkspaceProcessor

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

const WorkspaceContext = createContext();

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProcessor = ({ children }) => {
    const dispatch = useDispatch();
    const [workspaceIsLoading, setWorkspaceIsLoading] = useState(false);
    const imageSavePath = useSelector((state) => state.toolbar.imageSavePath);

    // we need to remember what the userid is, so that we can save the workspace to the correct location
    const [localUserId, setLocalUserId] = useState('');

    // next we need a component that will save the workspace to the user's GCS bucket when any of the following events occur:
    // - The user clicks the save button
    // - The user logs out
    // - The user closes the browser
    // - The user navigates away from the page
    // This component will be named saveWorkspace and will be called from the WorkspaceFile component
    const saveWorkspace = async () => {
        console.log('Saving workspace: localUserId:', localUserId, 'imageSavePath:', imageSavePath);
        try {
            const workspaceData = {
                userId: localUserId,
                imageSavePath: imageSavePath,
                currentFiles: ['file1.jpg', 'file2.jpg'], // Replace with the actual list of files
            };
            await axios.post('/api/user/saveWorkspace', workspaceData); // Adjust the URL as needed
            console.log('Workspace saved successfully');
        } catch (error) {
            console.error('Error saving workspace:', error);
        }
    };
    // next we need a component that will load the workspace from the user's GCS bucket when the user logs in.
    // This component will be named loadWorkspace and will be called from the WorkspaceFile component
    const loadWorkspace = async ( theUserId ) => {
        // Load the workspace from the user's workspace file in the GCS bucket named /fjusers/{userEmail}/fjuserworkspace.dat
        // The workspace is saved as a JSON object containing the following fields:
        // - Current image save path(just the name of the folder where the images are saved in the bucket)
        // - List of gcs bucket files currently being worked on
        // It will NOT use firebase, but will use the GCS bucket directly
        console.log('Loading workspace for user:', theUserId);
        setLocalUserId(theUserId);

        setWorkspaceIsLoading(true);
        try {
            const response = await axios.post('/api/user/loadWorkspace', { userId: theUserId });
            const loadedWorkspace = response.data;

            console.log("Workspace data loaded is: ", loadedWorkspace);

            console.log('Workspace loaded successfully');
        } catch (error) {
            console.error('Error loading workspace:', error);


            // And create a new workspace file in the user's GCS bucket(if it doesn't already exist) with an empty object
            await saveWorkspace();

        } finally {
            setWorkspaceIsLoading(false);
        }
    };

    // this effect will run when the component mounts and will add an event listener to the window object
    useEffect(() => {
        console.log('WorkspaceProcessor mounted/updated');
        // Add an event listener to the window object to save the workspace when the user navigates away from the page 
        // for any reason, i.e. when the user logs out, closes the browser, or navigates away from the page
        window.addEventListener('beforeunload', saveWorkspace);
    
        return () => {
            window.removeEventListener('beforeunload', saveWorkspace);
        };
    }, []);

    return (
        <WorkspaceContext.Provider value={{ saveWorkspace, loadWorkspace, workspaceIsLoading }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export default WorkspaceProcessor;