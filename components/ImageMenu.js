// components/ImageMenu.js
import React from 'react';
import { MenuItem } from '@mui/material';

const ImageMenu = ({ open, onClose, menuItems, anchorPosition }) => {
  if (!open || !anchorPosition) return null;

  const menuStyle = {
    position: 'fixed',
    top: anchorPosition.y,
    left: anchorPosition.x,
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    borderRadius: '4px',
    padding: '8px 0',
  };

  const handleItemClick = (onClick) => {
    onClick();
    onClose();
  };

  return (
    <div style={menuStyle}>
      {menuItems.map((item, index) => (
        <MenuItem key={index} onClick={() => handleItemClick(item.onClick)}>
          {item.label}
        </MenuItem>
      ))}
    </div>
  );
};

export default ImageMenu;
