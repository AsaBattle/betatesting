
// ViewMode.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/authService';
import styles from './ViewMode.module.css';
import { useRouter } from 'next/router';

export default function ViewMode( theUserData ) {
  const [files, setFiles] = useState([]);
  const router = useRouter();


  useEffect(() => {
    //console.log("theUserData is: ", theUserData);
    console.log("theUserData.user_id is: ", theUserData.userData)

  const fetchFiles = async () => {
      try {
        const response = await axios.get(`/api/files?userId=${theUserData.userData.user_id}`);
        setFiles(response.data.files);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [theUserData]);
  

  const handleImageClick = async (file) => {
    try {
      const imageUrl = file.url;
      const aspectRatioName = calculateAspectRatio(file.width, file.height);
      router.push({
        pathname: '/ImageMode',
        query: { imageUrl, aspectRatioName },
      });
    } catch (error) {
      console.error('Error handling image click:', error);
    }
  };
  /*
  const handleImageClick = async (file) => {
    try {
      console.log('Fetching file:', file.url);
      const response = await fetch(`/api/fetchImage?imagePath=${encodeURIComponent(file.url)}`, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const blob = await response.blob();
  
      console.log('I got the file!');
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = () => {
          const aspectRatioName = calculateAspectRatio(img.width, img.height);
          router.push({
            pathname: '/ImageMode',
            query: { dataUrl, aspectRatioName },
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error handling image click:', error);
    }
  };*/



  const calculateAspectRatio = (width, height) => {
    // Define your aspect ratios and names here
    const aspectRatios = {
      '1:1': 1,
      '16:9': 16 / 9,
      '9:16': 9 / 16,
      '43': 4 / 3,
      '34': 3 / 4,
    };

    let closestAspectRatioName = '1:1';
    let smallestDifference = Infinity;
    const imageAspectRatio = width / height;

    Object.entries(aspectRatios).forEach(([name, ratio]) => {
      const difference = Math.abs(ratio - imageAspectRatio);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestAspectRatioName = name;
      }
    });

    return closestAspectRatioName;
  };

  return (
    <div className={styles.viewMode}>
      <h2 className={styles.heading}>Your Generated Files</h2>
      <div className={styles.fileGrid}>
        {files.map((file) => (
          <div key={file.name} className={styles.fileTile} onClick={() => handleImageClick(file)}>
            <img src={file.url} alt={file.name} className={styles.fileImage} />
            <p className={styles.fileName}>{file.name}</p>
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
      console.log("Checking if user is already logged in...")
      const userData = await AuthService.checkIfUserIsAlreadyLoggedIn(req, res);

      if (userData) {
        console.log("Yes, logged in - UserData returned from checkIfUserIsAlreadyLoggedIn is: ", userData)
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