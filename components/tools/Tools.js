import { Brush, ZoomIn, SplitSquareVertical } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { incIndex,decIndex } from '../../redux/slices/historySlice';

export function getResolution(aspectRatioName) {
  switch (aspectRatioName) {
    case 'Square':
      return { width: 1024, height: 1024, displayWidth: 512 };
    case 'Wide':
      return { width: 1024, height: 512, displayWidth: 512 };
    case 'Tall':
      return { width: 512, height: 1024, displayWidth: 348 };
    case '4:3':
      return { width: 1024, height: 768, displayWidth: 512 };
    case '3:4':
      return { width: 768, height: 1024, displayWidth: 512 };
    default:
      return { width: 1024, height: 1024, displayWidth: 512 }; // Default square aspect ratio
  }
}

export const tools = [
  { 
    name: 'MaskPainter',
    label: 'Mask Painter',  // For accessibility purposes, when hovering over
    icon: <Brush />,        // The icon component
    cursor: `url('/pen-cursor(w)2.png'), auto`,
    renderInToolbar: true,  // Whether or not to render this tool in the toolbar
    processTool: (dispatch) => {
      console.log('Processing MaskPainter');
    }
  },
  { 
    name: 'AspectRatio',
    label: 'aspect ratio',
    icon: <ZoomIn />, 
    renderInToolbar: false,
    cursor: 'zoom-in',
    processTool: (dispatch) => {
      console.log('processing aspect ratio');
    },
  },
  { 
    name: 'Zoom',
    label: 'Zoom In/Out',
    icon: <ZoomIn />, 
    renderInToolbar: true, 
    cursor: 'zoom-in',
    processTool: (dispatch) => {
      console.log('Processing tool2');
    }
  }, 
]; 