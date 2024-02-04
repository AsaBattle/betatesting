import React, { useEffect, useState } from 'react';

const Cursor = ({ brushSize, isDrawing }) => {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    let mql = false;

    useEffect(() => {
        // Define the matchMedia query
        mql = window.matchMedia('(max-width: 768px)');
        
        console.log('mql:', mql);

        // Handler to set state
        const handleMatchMedia = (event) => {
            console.log('handleMatchMedia is executing, event.matches:', event.matches);
            setIsMobile(event.matches);
        };

        // Set the initial value based on the current width
        setIsMobile(mql.matches);

        // Add a listener for when the viewport width changes
        const listener = () => setIsMobile(mql.matches);
        mql.addEventListener('change', handleMatchMedia);

        return () => {
            // Clean up the listener when the component is unmounted
            mql.removeEventListener('change', handleMatchMedia);
        };
    }, []);

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
        if (!isMobile)
            window.addEventListener('mousemove', onMouseMove);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [brushSize, isDrawing, isMobile]);

    // Don't render the cursor if on a mobile device
    if (isMobile || !cursorPos) return null;

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
