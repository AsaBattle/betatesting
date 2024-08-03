import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/authService';
import styles from './ViewMode.module.css';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import {
  setViewModeLoadedImages,
  setSortBy,
  setSortOrder,
  setColumns,
  setMaxImagesPerPage,
  setCurrentPage,
  setImageSavePath,
} from '../redux/slices/historySlice';
import {
  Grid,
  Slider,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Folder } from '@mui/icons-material';
import alogger from '../utils/alogger';

// New component for Folder Options
const FolderOptions = ({ onNewFolder, onDeleteFolder, onRenameFolder, onMoveFolder }) => {
  return (
    <Paper elevation={3} className={styles.folderOptions}>
      <Typography variant="h6" align="center" gutterBottom>
        Folder Options
      </Typography>
      <div className={styles.folderButtons}>
        <Button variant="contained" onClick={onNewFolder}>New</Button>
        <Button variant="contained" onClick={onDeleteFolder}>Delete</Button>
        <Button variant="contained" onClick={onRenameFolder}>Rename</Button>
        <Button variant="contained" onClick={onMoveFolder}>Move</Button>
      </div>
    </Paper>
  );
};

export default function ViewMode(theUserData) {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const currentUserId = useSelector((state) => state.history.userId);
  const imageSavePath = useSelector((state) => state.history.imageSavePath);
  const columns = useSelector((state) => state.history.columns);
  const maxImagesPerPage = useSelector((state) => state.history.maxImagesPerPage);
  const sortBy = useSelector((state) => state.history.sortBy);
  const sortOrder = useSelector((state) => state.history.sortOrder);

  const [files, setFiles] = useState([]);
  const [rows, setRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const pageSize = maxImagesPerPage;

// each option needs to open it's own input dialog to get the folder path or whatever is needed


  const handleNewFolder = async () => {
    alogger("New Folder button clicked");
    try {
      const body = {
        userId: currentUserId,
        folderAction: 'createFolder',
        newFolderPath: 'path/to/new/folder' // Replace with actual new folder path
      };
      const response = await axios.post('/api/user/folderOptions', body);
      alogger('New folder created:', response.data);
    } catch (error) {
      alogger('Error creating new folder:', error);
    }
  };
  
  const handleDeleteFolder = async () => {
    alogger("Delete Folder button clicked");
    try {
      const body = {
        userId: currentUserId,
        folderAction: 'delete',
        folderPath: 'path/to/folder' // Replace with actual folder path to delete
      };
      const response = await axios.post('/api/user/folderOptions', body);
      alogger('Folder deleted:', response.data);
    } catch (error) {
      alogger('Error deleting folder:', error);
    }
  };
  
  const handleRenameFolder = async () => {
    alogger("Rename Folder button clicked");
    try {
      const body = {
        userId: currentUserId,
        folderAction: 'rename',
        oldFolderPath: 'path/to/old/folder', // Replace with actual old folder path
        newFolderPath: 'path/to/new/folder' // Replace with actual new folder path
      };
      const response = await axios.post('/api/user/folderOptions', body);
      alogger('Folder renamed:', response.data);
    } catch (error) {
      alogger('Error renaming folder:', error);
    }
  };
  
  const handleMoveFolder = async () => {
    alogger("Move Folder button clicked");
    try {
      const body = {
        userId: currentUserId,
        folderAction: 'move',
        sourceFolderPath: 'path/to/source/folder', // Replace with actual source folder path
        destinationFolderPath: 'path/to/destination/folder' // Replace with actual destination folder path
      };
      const response = await axios.post('/api/user/folderOptions', body);
      alogger('Folder moved:', response.data);
    } catch (error) {
      alogger('Error moving folder:', error);
    }
  };

  useEffect(() => {
    alogger("Loading images for user: ", currentUserId, " from folder: ", imageSavePath, " ...");
    fetchFiles();
  }, [currentUserId, imageSavePath, columns, currentPage, maxImagesPerPage]);

  const fetchFiles = async () => {
    try {
      const body = { 
        userId: currentUserId, 
        folder: imageSavePath,
        page: currentPage,
        pageSize: pageSize
      };
      const response = await axios.post(`/api/files`, body);
      const { files, pagination } = response.data;
      alogger('Files fetched:', files);
      setFiles(files);
      setTotalPages(pagination.totalPages);
      setTotalFiles(pagination.totalFiles);
      setRows(Math.ceil(files.length / columns));
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    const sortedFiles = [...files].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'az'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'date':
          return sortOrder === 'newest'
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
        case 'size':
          return sortOrder === 'largest'
            ? b.size - a.size
            : a.size - b.size;
        default:
          return 0;
      }
    });
    setFiles(sortedFiles);
    alogger('sortBy or sortOrder changed: ', sortBy, sortOrder);
  }, [sortBy, sortOrder]);

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
    dispatch(setColumns(newValue));
    setRows(Math.ceil(files.length / newValue));
  };

  const handleImageSavePathChange = (event) => {
    dispatch(setImageSavePath(event.target.value));
  };

  const handleMaxImagesPerPageChange = (event, newValue) => {
    dispatch(setMaxImagesPerPage(newValue));
  };

  const handleSortByChange = (event) => {
    const newSortBy = event.target.value;
    dispatch(setSortBy(newSortBy));
    
    // Reset sortOrder based on the new sortBy value
    let newSortOrder;
    switch (newSortBy) {
      case 'name':
        newSortOrder = 'az';
        break;
      case 'date':
        newSortOrder = 'newest';
        break;
      case 'size':
        newSortOrder = 'largest';
        break;
      default:
        newSortOrder = '';
    }
    dispatch(setSortOrder(newSortOrder));
    
    alogger('handleSortByChange: ', newSortBy);
  };

  const handleSortOrderChange = (event) => {
    dispatch(setSortOrder(event.target.value));
  };

  const getSortOrderOptions = () => {
    switch (sortBy) {
      case 'name':
        return [
          <MenuItem key="az" value="az">A-Z</MenuItem>,
          <MenuItem key="za" value="za">Z-A</MenuItem>
        ];
      case 'date':
        return [
          <MenuItem key="newest" value="newest">Newest to Oldest</MenuItem>,
          <MenuItem key="oldest" value="oldest">Oldest to Newest</MenuItem>
        ];
      case 'size':
        return [
          <MenuItem key="largest" value="largest">Largest to Smallest</MenuItem>,
          <MenuItem key="smallest" value="smallest">Smallest to Largest</MenuItem>
        ];
      default:
        return [<MenuItem key="default" value="">Select an option</MenuItem>];
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
            <FolderOptions
              onNewFolder={handleNewFolder}
              onDeleteFolder={handleDeleteFolder}
              onRenameFolder={handleRenameFolder}
              onMoveFolder={handleMoveFolder}
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
            <FormControl fullWidth className={`${styles.formControlWithLabel} ${styles.responsiveFormControl} ${styles.adjustedFormControl}`}>
              <InputLabel className={styles.inputLabel}>Sort By</InputLabel>
              <Select value={sortBy} onChange={handleSortByChange}>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="size">Size</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {sortBy && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth className={`${styles.formControlWithLabel} ${styles.responsiveFormControl} ${styles.adjustedFormControl}`}>
                <InputLabel className={styles.inputLabel}>Sort Order</InputLabel>
                <Select value={sortOrder} onChange={handleSortOrderChange}>
                  {getSortOrderOptions()}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>
  
      <Paper elevation={3} className={styles.statsPanel}>
        <Typography variant="h6">Current Layout: {columns} x {rows}</Typography>
        <Typography variant="h6">Total Images: {totalFiles}</Typography>
        <Typography variant="h6">Pages: {totalPages}</Typography>
      </Paper>
  
      <div className={styles.fileGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {files.map((file) => (
          <Paper 
            key={file.name}
            elevation={6} 
            className={styles.controlPanel} 
            style={{ padding: '4px', margin: '4px' }}
          >
            <div 
              key={file.name} 
              className={styles.fileTile} 
              onClick={() => handleImageClick(file)}
              style={{ margin: 0, padding: 0 }}
            >
              <img 
                src={file.url} 
                alt={file.name} 
                className={styles.fileImage} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </Paper>
        ))}
      </div>
  
      <div className={styles.pagination}>
        <Button
          disabled={currentPage === 1}
          onClick={handlePrevPage}
        >
          Previous
        </Button>
        <Typography>Page {currentPage} of {totalPages}</Typography>
        <Button
          disabled={currentPage === totalPages}
          onClick={handleNextPage}
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
/* Old viewmode before adding folder option buttons
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/authService';
import styles from './ViewMode.module.css';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import {
  setViewModeLoadedImages,
  setSortBy,
  setSortOrder,
  setColumns,
  setMaxImagesPerPage,
  setCurrentPage,
  setImageSavePath,
} from '../redux/slices/historySlice';
import {
  Grid,
  Slider,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Folder } from '@mui/icons-material';
import alogger from '../utils/alogger';

export default function ViewMode(theUserData) {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const currentUserId = useSelector((state) => state.history.userId);
  const imageSavePath = useSelector((state) => state.history.imageSavePath);
  const columns = useSelector((state) => state.history.columns);
  const maxImagesPerPage = useSelector((state) => state.history.maxImagesPerPage);
  const sortBy = useSelector((state) => state.history.sortBy);
  const sortOrder = useSelector((state) => state.history.sortOrder);

  const [files, setFiles] = useState([]);
  const [rows, setRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const pageSize = maxImagesPerPage; // Use maxImagesPerPage as pageSize

  useEffect(() => {
    alogger("Loading images for user: ", currentUserId, " from folder: ", imageSavePath, " ...");
    fetchFiles();
  }, [currentUserId, imageSavePath, columns, currentPage, maxImagesPerPage]);

  const fetchFiles = async () => {
    try {
      const body = { 
        userId: currentUserId, 
        folder: imageSavePath,
        page: currentPage,
        pageSize: pageSize
      };
      const response = await axios.post(`/api/files`, body);
      const { files, pagination } = response.data;
      alogger('Files fetched:', files);
      setFiles(files);
      setTotalPages(pagination.totalPages);
      setTotalFiles(pagination.totalFiles);
      setRows(Math.ceil(files.length / columns));
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    const sortedFiles = [...files].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'az'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'date':
          return sortOrder === 'newest'
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
        case 'size':
          return sortOrder === 'largest'
            ? b.size - a.size
            : a.size - b.size;
        default:
          return 0;
      }
    });
    setFiles(sortedFiles);
    alogger('sortBy or sortOrder changed: ', sortBy, sortOrder);
  }, [sortBy, sortOrder]);

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
    dispatch(setColumns(newValue));
    setRows(Math.ceil(files.length / newValue));
  };

  const handleImageSavePathChange = (event) => {
    dispatch(setImageSavePath(event.target.value));
  };

  const handleMaxImagesPerPageChange = (event, newValue) => {
    dispatch(setMaxImagesPerPage(newValue));
  };

  const handleSortByChange = (event) => {
    const newSortBy = event.target.value;
    dispatch(setSortBy(newSortBy));
    
    // Reset sortOrder based on the new sortBy value
    let newSortOrder;
    switch (newSortBy) {
      case 'name':
        newSortOrder = 'az';
        break;
      case 'date':
        newSortOrder = 'newest';
        break;
      case 'size':
        newSortOrder = 'largest';
        break;
      default:
        newSortOrder = '';
    }
    dispatch(setSortOrder(newSortOrder));
    
    alogger('handleSortByChange: ', newSortBy);
  };

  const handleSortOrderChange = (event) => {
    dispatch(setSortOrder(event.target.value));
  };

  const getSortOrderOptions = () => {
    switch (sortBy) {
      case 'name':
        return [
          <MenuItem key="az" value="az">A-Z</MenuItem>,
          <MenuItem key="za" value="za">Z-A</MenuItem>
        ];
      case 'date':
        return [
          <MenuItem key="newest" value="newest">Newest to Oldest</MenuItem>,
          <MenuItem key="oldest" value="oldest">Oldest to Newest</MenuItem>
        ];
      case 'size':
        return [
          <MenuItem key="largest" value="largest">Largest to Smallest</MenuItem>,
          <MenuItem key="smallest" value="smallest">Smallest to Largest</MenuItem>
        ];
      default:
        return [<MenuItem key="default" value="">Select an option</MenuItem>];
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth className={styles.formControlWithLabel}>
                <InputLabel className={styles.inputLabel}>Sort By</InputLabel>
                <Select value={sortBy} onChange={handleSortByChange}>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="size">Size</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {sortBy && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth className={styles.formControlWithLabel}>
                  <InputLabel className={styles.inputLabel}>Sort Order</InputLabel>
                  <Select value={sortOrder} onChange={handleSortOrderChange}>
                    {getSortOrderOptions()}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Paper>
  
      <Paper elevation={3} className={styles.statsPanel}>
        <Typography variant="h6">Current Layout: {columns} x {rows}</Typography>
        <Typography variant="h6">Total Images: {totalFiles}</Typography>
        <Typography variant="h6">Pages: {totalPages}</Typography>
      </Paper>
  
      <div className={styles.fileGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {files.map((file) => (
          <Paper 
            key={file.name}
            elevation={6} 
            className={styles.controlPanel} 
            style={{ padding: '4px', margin: '4px' }}
          >
            <div 
              key={file.name} 
              className={styles.fileTile} 
              onClick={() => handleImageClick(file)}
              style={{ margin: 0, padding: 0 }}
            >
              <img 
                src={file.url} 
                alt={file.name} 
                className={styles.fileImage} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </Paper>
        ))}
      </div>
  
      <div className={styles.pagination}>
        <Button
          disabled={currentPage === 1}
          onClick={handlePrevPage}
        >
          Previous
        </Button>
        <Typography>Page {currentPage} of {totalPages}</Typography>
        <Button
          disabled={currentPage === totalPages}
          onClick={handleNextPage}
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
} */