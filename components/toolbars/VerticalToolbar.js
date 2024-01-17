import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { tools } from '../tools/Tools';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTool } from '../../redux/slices/toolSlice';
import styles from './VerticalToolbar.module.css';

const VerticalToolbar = ({ onToolSelected }) => {
  const dispatch = useDispatch();
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);

  const handleButtonClick = (tool) => {
    dispatch(setCurrentTool(tool.name));  // Dispatch only the tool's name
    if (onToolSelected) {
      onToolSelected(tool);  // Continue passing the full tool object to the callback
    }
    console.log(`Switched to tool: ${tool.name}`);
  };

  return (
    <Stack
      direction="column"
      spacing={2}
      className={styles.toolbarStack}
    >
      {tools.map((tool) => (
        <Button
          key={tool.name}
          variant="contained"
          onClick={() => handleButtonClick(tool)}
          startIcon={<span className={styles.icon}>{tool.icon}</span>}
          className={`${styles.button} ${currentToolName === tool.name ? styles.selectedButton : ''}`}
        >
        </Button>
      ))}
    </Stack>
  );
}

export default VerticalToolbar;
