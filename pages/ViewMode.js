import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/authService';
import styles from './ViewMode.module.css';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { setViewModeLoadedImages } from '../redux/slices/historySlice';
import { setImageSavePath } from '../redux/slices/toolSlice';
import { Grid, Slider, TextField, Button, Typography, Paper, Container,
          FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import { ViewModule, Folder, ImageSearch } from '@mui/icons-material';

import alogger from '../utils/alogger';

export default function ViewMode(theUserData) {
  const [files, setFiles] = useState([]);
  const [columns, setColumns] = useState(5);
  const [rows, setRows] = useState(0);
  const [maxImagesPerPage, setMaxImagesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const currentUserId = useSelector((state) => state.history.userId);
  const dispatch = useDispatch();
  const imageSavePath = useSelector((state) => state.toolbar.imageSavePath);
  const [sortBy, setSortBy] = useState('');


  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
  };


  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const body = { userId: currentUserId, folder: imageSavePath };
        const response = await axios.post(`/api/files`, body);
        setFiles(response.data.files);
        setRows(Math.ceil(response.data.files.length / columns));
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [currentUserId, imageSavePath, columns]);

  const handleImageClick = async (file) => {
    try {
      const imageUrl = file.url;
      const aspectRatioName = calculateAspectRatio(file.width, file.height);
      alogger("^^^^^^^^^^^^^ width: ", file.width, " height: ", file.height, " aspectRatioName: ", aspectRatioName);
      dispatch(setViewModeLoadedImages({ imageUrl, aspectRatioName }));
      router.push('/ImageMode');
    } catch (error) {
      console.error('Error handling image click:', error);
    }
  };

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

  const handleColumnsChange = (event, newValue) => {
    setColumns(newValue);
    setRows(Math.ceil(files.length / newValue));
  };

  const handleImageSavePathChange = (event) => {
    dispatch(setImageSavePath(event.target.value));
  };

  const handleMaxImagesPerPageChange = (event, newValue) => {
    setMaxImagesPerPage(newValue);
  };

  const paginatedFiles = files.slice((currentPage - 1) * maxImagesPerPage, currentPage * maxImagesPerPage);

  return (
    <Container maxWidth="false" className={styles.viewMode}>
      
      <Paper elevation={3} className={styles.controlPanel}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Columns: {columns}</Typography>
            <Slider
              value={columns}
              onChange={handleColumnsChange}
              min={1}
              max={10}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Image Save Path"
              value={imageSavePath}
              onChange={handleImageSavePathChange}
              fullWidth
              InputProps={{
                startAdornment: <Folder />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Max Images Per Page: {maxImagesPerPage}</Typography>
            <Slider
              value={maxImagesPerPage}
              onChange={handleMaxImagesPerPageChange}
              min={1}
              max={100}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortByChange}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="size">Size</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} className={styles.statsPanel}>
        <Typography variant="h6">Current Layout: {columns} x {rows}</Typography>
        <Typography variant="h6">Total Images: {files.length}</Typography>
        <Typography variant="h6">Pages: {Math.ceil(files.length / maxImagesPerPage)}</Typography>
      </Paper>

      <div className={styles.fileGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {paginatedFiles.map((file) => (
          <Paper 
            key={file.name}
            elevation={6} 
            className={styles.controlPanel} 
            style={{ padding: '4px', margin: '4px' }} // Reduced padding and added small margin
          >
            <div 
              key={file.name} 
              className={styles.fileTile} 
              onClick={() => handleImageClick(file)}
              style={{ margin: 0, padding: 0 }} // Remove any margin or padding
            >
              <img 
                src={file.url} 
                alt={file.name} 
                className={styles.fileImage} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Maximize image size
              />
            </div>
          </Paper>
        ))}
      </div>

  
  
      <div className={styles.pagination}>
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </Button>
        <Typography>Page {currentPage} of {Math.ceil(files.length / maxImagesPerPage)}</Typography>
        <Button
          disabled={currentPage === Math.ceil(files.length / maxImagesPerPage)}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </Button>
      </div>
    </Container>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;

  if (process.env.NEXT_PUBLIC_WORKING_LOCALLY === 'true')
    return { props: {} };

  try {
    const userData = await AuthService.checkIfUserIsAlreadyLoggedIn(req, res);
    if (userData) {
      return { props: { userData } };
    }
  } catch (error) {
    console.error('Error during authentication:', error);
  }
  return { props: {} };
}