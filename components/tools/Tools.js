import { Brush, ZoomIn } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { incIndex,decIndex } from '../../redux/slices/historySlice';

export const tools = [
  { 
    name: 'MaskPainter',
    label: 'Mask Painter',  // For accessibility purposes, when hovering over
    icon: <Brush />,        // The icon component
    cursor: `url('/pen-cursor(w)2.png'), auto`,
    processTool: (dispatch) => {
      console.log('Processing MaskPainter');
    }
  },
  { 
    name: 'Zoom',
    label: 'Zoom In/Out',
    icon: <ZoomIn />, 
    cursor: 'zoom-in',
    processTool: (dispatch) => {
      console.log('Processing tool2');
    }
  },  
]; 