import { Brush, ZoomIn, SplitSquareVertical } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { incIndex,decIndex } from '../../redux/slices/historySlice';



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
   /* aspectRatios: [
      {name: 'wide', icon: <
      'tall',
      '43',
      '34',
    ],*/
  },
 /* { 
    name: 'Zoom',
    label: 'Zoom In/Out',
    icon: <ZoomIn />, 
    cursor: 'zoom-in',
    processTool: (dispatch) => {
      console.log('Processing tool2');
    }
  }, */ 
]; 