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

import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useRouter } from 'next/router';
import alogger from '../utils/logger';

export const WorkspaceProcessor = forwardRef(({ userId, predictions }, ref) => {
    const [workspaceIsLoading, setWorkspaceIsLoading] = useState(false);
    const imageSavePath = useSelector((state) => state.toolbar.imageSavePath);
    const router = useRouter();
    const currentUserId = useSelector((state) => state.history.userId);

    // next we need a component that will save the workspace to the user's GCS bucket when any of the following events occur:
    // - The user clicks the save button
    // - The user logs out
    // - The user closes the browser
    // - The user navigates away from the page
    // This component will be named saveWorkspace and will be called from the WorkspaceFile component
    const saveWorkspace = async () => {
        let predList = predictions
        alogger('Saving workspace: userId:', userId, 'imageSavePath:', imageSavePath);
        
        if (!predictions || predictions.length === 0) {
            alogger('No predictions to save');

        }

        try {
            const workspaceData = {
                userId: userId,
                imageSavePath: imageSavePath,
                currentFiles: predList,
            };
            await axios.post('/api/user/saveWorkspace', workspaceData);
            alogger('Workspace saved successfully');
        } catch (error) {
            console.error('Error saving workspace:', error);
        }
    };

    // next we need a component that will load the workspace from the user's GCS bucket when the user logs in.
    // This component will be named loadWorkspace and will be called from the WorkspaceFile component
    const loadWorkspace = async () => {
        // Load the workspace from the user's workspace file in the GCS bucket named /fjusers/{userEmail}/fjuserworkspace.dat
        // The workspace is saved as a JSON object containing the following fields:
        // - Current image save path(just the name of the folder where the images are saved in the bucket)
        // - List of gcs bucket files currently being worked on
        // It will NOT use firebase, but will use the GCS bucket directly
        alogger('Loading workspace for user:', currentUserId);
        setWorkspaceIsLoading(true);
        try {
            const response = await axios.post('/api/user/loadWorkspace', { userId: currentUserId });
            const loadedWorkspace = response.data;
            alogger("Workspace data loaded is: ", loadedWorkspace);
            alogger('Workspace loaded successfully');
            return loadedWorkspace;
        } catch (error) {
            console.error('Error loading workspace:', error);
            // And create a new workspace file in the user's GCS bucket(if it doesn't already exist) with an empty object
            await saveWorkspace();
            return null;
        } finally {
            setWorkspaceIsLoading(false);
        }
    };

    // this effect will run when the component mounts and will add an event listener to the window object
    useEffect(() => {
        alogger('WorkspaceProcessor mounted/updated');
        // Add an event listener to the window object to save the workspace when the user navigates away from the page 
        // for any reason, i.e. when the user logs out, closes the browser, or navigates away from the page
        const handleBeforeUnload = (event) => {
            alogger('Saving workspace before unload');
            event.preventDefault();
            event.returnValue = '';
            saveWorkspace();
        };

        const handleRouteChange = () => {
            alogger('Saving workspace before route change');
            saveWorkspace();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        router.events.on('routeChangeStart', handleRouteChange);
    
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, [userId, imageSavePath, predictions, router]);

    useImperativeHandle(ref, () => ({
        saveWorkspace,
        loadWorkspace
    }));

    return null; // This component doesn't render anything
});

// Vercel needs this displayName to build correctly
WorkspaceProcessor.displayName = 'WorkspaceProcessor';


export default WorkspaceProcessor;