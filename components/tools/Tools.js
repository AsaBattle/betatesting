import { Brush, ZoomIn } from 'lucide-react';

export const tools = [
  { 
    name: 'MaskPainter',
    label: 'Mask Painter',  // For accessibility purposes, when hovering over
    icon: <Brush />,        // The icon component
    processTool: () => {
      console.log('Processing MaskPainter');
    }
  },
  /*{ 
    name: 'Zoom',
    label: 'Zoom In/Out',
    icon: <ZoomIn />, 
    processTool: () => {
      console.log('Processing tool2');
    }
  },*/
]; 