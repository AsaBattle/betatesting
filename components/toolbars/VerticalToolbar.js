// VerticalToolbar.js
import React from 'react';
import { useEffect } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { tools } from '../tools/Tools';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTool } from '../../redux/slices/toolSlice'; // Import the action from the slice
import styles from './VerticalToolbar.module.css'; // Make sure the path is correct

const VerticalToolbar = () => {

  const dispatch = useDispatch();
  const currentTool = useSelector((state) => state.toolbar.currentTool);

  const handleButtonClick = (tool) => {
    dispatch(setCurrentTool(tool));
    console.log(`Switched to tool: ${tool.name}`);
  };

  useEffect(() => {
    // Ensure the component is mounted before attempting to access the DOM element
    const element = document.querySelector(`.${styles.toolbarStack}`);
    if (element) {
      console.log(window.getComputedStyle(element));
    }
  }, []); // Empty dependency array ensures this effect runs once on mount

  return (
    <Stack
      direction="column"
      spacing={2}
      className={styles.toolbarStack} // Use the class from your CSS module
    >
      {tools.map((tool) => (
        <Button
          key={tool.name}
          variant="contained"
          onClick={() => handleButtonClick(tool)}
          startIcon={<span className={styles.icon}>{tool.icon}</span>}
          className={`${styles.button} ${currentTool.name === tool.name ? styles.selectedButton : ''}`}
        >
        </Button>
      ))}
    </Stack>
  );
}

export default VerticalToolbar;
