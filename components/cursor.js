import React, { useEffect, useState } from 'react';

const Cursor = ({ brushSize, isDrawing }) => {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const onMouseMove = (e) => {
            //console.log('onMouseMove is executing, e.clientX:', e.clientX, 'e.clientY:', e.clientY);
            const canvasContainer = document.getElementById('canvasContainer');
            if (canvasContainer && isDrawing) {
                const rect = canvasContainer.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    setCursorPos({
                        x: e.clientX - rect.left+1,     // +1 and +2 to center the cursor as ...
                        y: e.clientY - rect.top+2,      //                             ...close as we can to the actual brush
                    });
                } else {
                    setCursorPos(null);
                }
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [brushSize, isDrawing]);

    if (!cursorPos) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.5)', // semi-transparent white circle
                pointerEvents: 'none', // allows the mouse events to pass through the div
                mixBlendMode: 'difference', // this will help to see the cursor on different backgrounds
                transform: 'translate(-50%, -50%)', // Center the cursor circle
            }}
        >
        </div>
    );
};

export default Cursor;
