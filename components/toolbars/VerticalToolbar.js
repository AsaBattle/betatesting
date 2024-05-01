import React, { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Menu } from 'lucide-react'; // Ensure this import is correct
import { useDispatch, useSelector } from 'react-redux';
import { setHamburgerVisible, setCurrentTool, setToolbarVisibility } from '../../redux/slices/toolSlice';
import { tools } from '../tools/Tools';
import styles from './VerticalToolbar.module.css';


// This function is a custom hook that returns the window width
function useWindowWidth() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    function checkSize() {
      setIsSmallScreen(window.innerWidth < 768);
    }

    checkSize(); // Check immediately on mount

    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return isSmallScreen;
}


const VerticalToolbar = (props) => {
  const dispatch = useDispatch();
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const isSmallScreen = useWindowWidth(); // Use custom hook

  // Set hamburger visibility based on screen size
  useEffect(() => {
    //console.log('VerticalToolbar: Setting hamburger visibility: ', isSmallScreen);
    dispatch(setHamburgerVisible(isSmallScreen));
    dispatch(setToolbarVisibility(!isSmallScreen)); // Hide toolbar on small screens
  }, [isSmallScreen]);



  const handleButtonClick = (tool) => {
    dispatch(setCurrentTool(tool.name));
    setIsToolbarVisible(false); // Hide toolbar after selection on small screens
    dispatch(setToolbarVisibility(false)); // Hide toolbar on small screens
    //tool.setup(props.canvasRef)

    
    //console.log(`Switched to tool: ${tool.name}`);
  };

  return (
    <>
      {isSmallScreen &&  (
        <button className={styles.hamburger} onClick={() => {setIsToolbarVisible(prev => {dispatch(setToolbarVisibility(!prev)); return !prev;})}}>
          <Menu /> {/* Adjust the size as needed */}
        </button>
      )}
      {(!isSmallScreen || isToolbarVisible) && (
        <Stack
          direction="column"
          spacing={2}
          className={styles.toolbarStack}
          style={{ overflowY: 'hidden' }}
        >
          {tools.map((tool) => (
            tool.renderInToolbar && (
              <Button
                key={tool.name}
                variant="contained"
                onClick={() => handleButtonClick(tool)}
                startIcon={<span className={styles.icon}>{tool.icon}</span>}
                className={`${styles.button} ${currentToolName === tool.name ? styles.selectedButton : ''}`}
              >
              </Button>
            )
          ))}
        </Stack>
      )}
    </>
  );
};

export default VerticalToolbar;
