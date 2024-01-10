import React from 'react';

const ToolbarOptions = ({ currentTool, brushSize, setBrushSize }) => {
  switch(currentTool) {
    case 'maskPainting':
      return <MaskPaintingOptions brushSize={brushSize} setBrushSize={setBrushSize} />;
    // Add cases for other tools
    default:
      return null;
  }
};


const MaskPaintingOptions = ({ brushSize, setBrushSize }) => {
  return (
    <div className="brush-slider-container text-white flex items-center justify-center mx-auto" style={{ width: '30%' }}>
      <label htmlFor="brushSize" className="flex-shrink-0 mr-2">Brush Size: {brushSize}</label>
      <input
        type="range"
        id="brushSize"
        name="brushSize"
        min="1"
        max="100"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        className="brush-slider flex-grow"
      />
    </div>
  );
};
export default ToolbarOptions;