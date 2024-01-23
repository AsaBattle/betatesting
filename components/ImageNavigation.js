// ImageNavigation.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { decIndex, incIndex, setIndex } from '../redux/slices/historySlice'; // Import relevant action creators
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const ImageNavigation = (props) => {
    const index = useSelector((state) => state.history.index);
    const dispatch = useDispatch();

    const handleLeftClick = () => {
        dispatch(decIndex());
    };

    const handleRightClick = () => {
        dispatch(incIndex());
    };

    const handleChange = (event, value) => {
        console.log('handleChange is executing: ' + (value));
        dispatch(setIndex(value));
      };


    return (
        <div>
        {props.imageTotal === 0 && 
            <div className="text-center font-helvetica text-xl text-white">
                 <div className="flex flex-col items-center justify-center">
                No Images to Display</div></div>}
        {props.imageTotal > 0 && (
          <div className="text-center font-helvetica text-xl text-white">
            <div className="flex flex-col items-center justify-center">
         
              <Pagination 
                    count={props.imageTotal} 
                    page={index}
                    onChange={handleChange} 
                    sx={{
                        "& .MuiPaginationItem-root": {
                        color: 'pink', // Color of all items
                        },
                        "& .MuiPaginationItem-root.Mui-selected": {
                        color: 'yellow', // Color of the selected item
                        },
                        "& .MuiPaginationItem-ellipsis": {
                        color: 'white', // Color of the ellipsis (...)
                        },
                        "& .MuiPaginationItem-icon": {
                        color: 'white', // Color of the icons
                        },
                    }}
                />
            </div>
          </div>
        )}
      </div>
    );
};

export default ImageNavigation;
