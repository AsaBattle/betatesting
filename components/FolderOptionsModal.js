import React, { useState } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Button,
  Paper
} from '@mui/material';
import YesNoModal from './YesNoModal';
import axios from 'axios';

const FolderOperationModal = ({ open, onClose, operation, userId }) => {
  const [folderName, setFolderName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isYesNoModalOpen, setIsYesNoModalOpen] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    let body;

    switch (operation) {
      case 'new':
        body = {
          userId,
          folderAction: 'createFolder',
          newFolderPath: folderName
        };
        break;
      case 'rename':
        body = {
          userId,
          folderAction: 'rename',
          oldFolderPath: folderName,
          newFolderPath: newFolderName
        };
        break;
      case 'delete':
        setIsYesNoModalOpen(true);
        return;
      case 'move':
        body = {
          userId,
          folderAction: 'move',
          sourceFolderPath: folderName,
          destinationFolderPath: newFolderName
        };
        break;
      default:
        setError('Invalid operation');
        return;
    }

    try {
      const response = await axios.post('/api/user/folderOptions', body);
      console.log('Operation successful:', response.data);
      onClose();
    } catch (error) {
      console.error('Error performing folder operation:', error);
      setError('Failed to perform folder operation');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.post('/api/user/folderOptions', {
        userId,
        folderAction: 'delete',
        folderPath: folderName
      });
      console.log('Folder deleted:', response.data);
      onClose();
    } catch (error) {
      console.error('Error deleting folder:', error);
      setError('Failed to delete folder');
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="folder-operation-modal"
      >
        <Paper>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2" gutterBottom>
              {operation.charAt(0).toUpperCase() + operation.slice(1)} Folder
            </Typography>
            <TextField
              fullWidth
              label={operation === 'new' ? 'New Folder Name' : 'Folder Name'}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              margin="normal"
            />
            {(operation === 'rename' || operation === 'move') && (
              <TextField
                fullWidth
                label={operation === 'rename' ? 'New Folder Name' : 'Destination Folder'}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                margin="normal"
              />
            )}
            {error && (
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={onClose} sx={{ mr: 1 }}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained">Submit</Button>
            </Box>
          </Box>
        </Paper>
      </Modal>
      <YesNoModal
        open={isYesNoModalOpen}
        onClose={() => setIsYesNoModalOpen(false)}
        onYes={handleDelete}
        onNo={() => setIsYesNoModalOpen(false)}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the folder "${folderName}"?`}
      />
    </>
  );
};

export default FolderOperationModal;