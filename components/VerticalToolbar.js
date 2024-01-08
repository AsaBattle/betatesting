import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Custom styling for the buttons
const StyledButton = styled(Button)({
  backgroundColor: '#757de8', // Custom button color
  color: 'white',
  padding: '10px 20px',
  margin: '5px',
  '&:hover': {
    backgroundColor: '#5a6abf', // Darker shade for hover state
  },
});

// Styled vertical toolbar using a Stack
const VerticalToolbar = () => {
  return (
    <Stack
      direction="column"
      spacing={2} // Spacing between items
      sx={{
        backgroundColor: '#4A90E2', // Background color for the toolbar
        padding: '10px',
        borderRadius: '10px', // Rounded corners for the toolbar
        width: 'fit-content', // Adjust width based on content
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Box shadow for depth
      }}
    >
      <StyledButton variant="contained">Item 1</StyledButton>
      <StyledButton variant="contained">Item 2</StyledButton>
      {/* Add more StyledButtons as needed */}
    </Stack>
  );
}

export default VerticalToolbar;


/* new one, with different top/bottom margins
import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Custom styling for the buttons
const StyledButton = styled(Button)({
  backgroundColor: '#757de8', // Custom button color
  color: 'white',
  padding: '6px 20px', // Reduced vertical padding
  margin: '3px', // Reduced margin between buttons
  '&:hover': {
    backgroundColor: '#5a6abf', // Darker shade for hover state
  },
});

// Styled vertical toolbar using a Stack
const VerticalToolbar = () => {
  return (
    <Stack
      direction="column"
      spacing={1} // Reduced spacing between items
      sx={{
        marginTop: '20vh',
        backgroundColor: '#4A90E2', // Background color for the toolbar
        padding: '8px', // Reduced padding of the overall Stack
        borderRadius: '10px', // Rounded corners for the toolbar
        width: 'fit-content', // Adjust width based on content
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Box shadow for depth
        // If needed, set a max-height and overflow for scrolling
        maxHeight: '50vh', // 80% of the viewport height, for example
        overflowY: 'auto',
      }}
    >
      <StyledButton variant="contained">Item 1</StyledButton>
      <StyledButton variant="contained">Item 2</StyledButton>
      </Stack>
      );
    }
    
    export default VerticalToolbar;
    
*/