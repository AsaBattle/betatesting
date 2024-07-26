import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setIndex } from '../redux/slices/historySlice';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import alogger from '../utils/alogger';

const ImageNavigation = ({ imageTotal, maxWidth }) => {
    const index = useSelector((state) => state.history.index);
    const dispatch = useDispatch();

    const handleChange = (event, value) => {
        alogger('handleChange is executing: ' + (value));
        dispatch(setIndex(value));
    };

    return (
        <div style={{ 
            width: '100%',
            maxWidth: maxWidth,
            margin: '0 auto',
            overflow: 'hidden',
        }}>
            {imageTotal === 0 && 
                <div className="text-center font-helvetica text-xl text-white">
                    <div className="flex flex-col items-center justify-center">
                        No Images to Display
                    </div>
                </div>
            }
            {imageTotal > 0 && (
               <div className="text-center font-helvetica text-xl text-white">
                   <Pagination 
                       count={imageTotal} 
                       page={index}
                       onChange={handleChange} 
                       size="small"
                       siblingCount={1}
                       boundaryCount={1}
                       renderItem={(item) => (
                           <PaginationItem
                               {...item}
                               components={{
                                   previous: (props) => <span {...props}>&#8249;</span>,
                                   next: (props) => <span {...props}>&#8250;</span>,
                               }}
                           />
                       )}
                       sx={{
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'center',
                           '& .MuiPagination-ul': {
                               flexWrap: 'nowrap',
                               overflowX: 'auto',
                               overflowY: 'hidden',
                               '&::-webkit-scrollbar': {
                                   display: 'none'
                               },
                               msOverflowStyle: 'none',
                               scrollbarWidth: 'none',
                           },
                           '& .MuiPaginationItem-root': {
                               color: 'pink',
                               fontSize: '1.5rem',
                               minWidth: '28px',
                               height: '28px',
                               padding: '0 8px',
                               margin: '0 1px',
                           },
                           '& .MuiPaginationItem-root.Mui-selected': {
                               color: 'yellow',
                           },
                           '& .MuiPaginationItem-ellipsis': {
                               color: 'white',
                           },
                           '& .MuiPaginationItem-icon': {
                               color: 'white',
                               fontSize: '1.25rem',
                           },
                       }}
                   />
               </div>
            )}
        </div>
    );
};

export default ImageNavigation;