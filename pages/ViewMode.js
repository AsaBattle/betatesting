import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ViewMode.module.css';

export default function ViewMode( theUserData ) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    console.log("theUserData.userData.user_id is: ", theUserData);

    const fetchFiles = async () => {
      try {
        const response = await axios.get(`/api/files?userId=${theUserData.userData.user_id}`);
        setFiles(response.data.files);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [theUserData.user_id]);

  return (
    <div className={styles.viewMode}>
      <h2>Your Generated Files</h2>
      <div className={styles.fileGrid}>
        {files.map((file) => (
          <div key={file.name} className={styles.fileTile}>
            <img src={file.url} alt={file.name} />
            <p>{file.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


export async function getServerSideProps(context) {
    const { req, res } = context;
  
    // If we are working locally, we don't need to check for authentication
    if (process.env.NEXT_PUBLIC_WORKING_LOCALLY == 'true')
      return { props: {} };
    else {
    try {
        const userData = await AuthService.checkIfUserIsAlreadyLoggedIn(req, res);
  
        if (userData) {
          console.log("UserData returned from checkIfUserIsAlreadyLoggedIn is: ", userData)
          // The user is authenticated, pass the user data as props
          return { props: { userData } };
        }
        // If userData is null, the user is not authenticated
      } catch (error) {
        console.error('Error during authentication:', error);
      }
    }
    // Return empty props if not authenticated
    return { props: {} };
  }