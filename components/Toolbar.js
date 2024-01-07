// components/Toolbar.js
import React from 'react';
import Draggable from 'react-draggable';
import styles from './Toolbar.module.css'; // Import your CSS module here
import PlaceholderTool from './tools/PlaceholderTool';


const Toolbar = ({ mode }) => {
  // Tools based on mode
  const tools = getToolsForMode(mode);

  return (
    <Draggable>
      <div className={styles.toolbar}>
        {tools.map((ToolComponent, index) => (
          <ToolComponent key={index} />
        ))}
      </div>
    </Draggable>
  );
};

// Function to return the tools required for the current mode
const getToolsForMode = (mode) => {
  const modeTools = {
    'Image': [PlaceholderTool,/* components for still picture tools */],
    'Video': [/* components for video tools */],
    'Storyboard': [/* components for storyboard tools */],
    'Sound': [/* components for sound tools */],
    'Media Viewer': [/* components for media viewer tools */],
    // Add other modes as necessary
  };

  return modeTools[mode] || [];
};

export default Toolbar;