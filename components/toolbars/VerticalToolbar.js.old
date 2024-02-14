import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu'; // Ensure this is installed
import { tools } from '../tools/Tools';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTool } from '../../redux/slices/toolSlice';
import styles from './VerticalToolbar.module.css';

const VerticalToolbar = ({ onToolSelected }) => {
  const dispatch = useDispatch();
  const currentToolName = useSelector((state) => state.toolbar.currentToolName);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleButtonClick = (tool) => {
    dispatch(setCurrentTool(tool.name));
    if (onToolSelected) {
      onToolSelected(tool);
    }
    handleClose(); // Close the menu after a tool is selected
  };
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        className={styles.menuButton}
        color="inherit"
        aria-label="menu"
        onClick={handleMenuClick}
        size="large"
        sx={{ display: { xs: 'block', md: 'none' } }} // Adjust these values based on your theme's breakpoints
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="toolbar-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top', // Align the top of the menu with the anchor element
          horizontal: 'right', // Align the menu to the right of the anchor element
        }}
        transformOrigin={{
          vertical: 'top', // Transform from the top
          horizontal: 'right', // Transform from the right
        }}
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
      </Menu>
      <Stack
        direction="column"
        spacing={2}
        className={styles.toolbarStack}
        sx={{ display: { xs: 'none', md: 'flex' } }} // Adjust these values based on your theme's breakpoints
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
    </>
  );
};

export default VerticalToolbar;
