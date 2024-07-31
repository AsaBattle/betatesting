// components/ImageMenu.js
import React, { forwardRef } from 'react';
import { MenuItem } from '@mui/material';

const ImageMenu = forwardRef(({ open, onClose, menuItems, anchorPosition }, ref) => {
  console.log("ImageMenu render. Open:", open, "AnchorPosition:", anchorPosition);
  
  if (!open || !anchorPosition) {
    console.log("ImageMenu not rendering due to:", !open ? "not open" : "no anchor position");
    return null;
  }

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
    <div ref={ref} style={menuStyle}>
      {menuItems.map((item, index) => (
        <MenuItem key={index} onClick={() => handleItemClick(item.onClick)}>
          {item.label}
        </MenuItem>
      ))}
    </div>
  );
});

ImageMenu.displayName = 'ImageMenu';

export default ImageMenu;