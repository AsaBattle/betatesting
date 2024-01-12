import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { tools } from './Tools';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTool } from '../../redux/slices/toolSlice'; // Import the action from the slice

// Custom styling for the buttons
const StyledButton = styled(Button)({
  backgroundColor: '#757de8', // Custom button color
  color: 'white',
  padding: '15px', // there are two padding properties, one for top/bottom of the button and one for left/right
  margin: '10px',
  '&:hover': {
    backgroundColor: '#5a6abf', // Darker shade for hover state
  },
});

// Styled vertical toolbar using a Stack
const VerticalToolbar = () => {
  // Use useDispatch hook to dispatch actions
  const dispatch = useDispatch();
  // Get the current tool from the Redux store
  const currentTool = useSelector((state) => state.toolbar.currentTool);

  const handleButtonClick = (tool) => {
    // Dispatch setCurrentTool action with the new tool
    dispatch(setCurrentTool(tool));
    console.log(`Switched to tool: ${tool.name}`);
  };

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        backgroundColor: '#4A90E2',
        padding: '10px',
        borderRadius: '10px',
        width: 'fit-content',
        height: 'fit-content',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {tools.map((tool) => (
        <StyledButton
          key={tool.name}
          variant="contained"
          onClick={() => handleButtonClick(tool)}
          startIcon={tool.icon}
          // Add a visual indicator for the currently selected tool
          style={{
            backgroundColor: currentTool.name === tool.name ? '#5a6abf' : '#757de8',
          }}
        >
        </StyledButton>
      ))}
    </Stack>
  );
}

export default VerticalToolbar;
