import React, { useEffect, useState } from 'react';

const Cursor = ({ brushSize, isDrawing }) => {
    const [cursorPos, setCursorPos] = useState(null); // Start with null, assume touch device
    const [hasMouse, setHasMouse] = useState(false); // State to track if a mousemove event has been detected

    useEffect(() => {
        // Handler to detect mouse movement
        const onMouseMoveDetect = () => {
            setHasMouse(true); // Set hasMouse to true when mouse is moved
            window.removeEventListener('mousemove', onMouseMoveDetect); // Remove listener after detecting mouse
        };

        // Add the mousemove event listener to the window
        window.addEventListener('mousemove', onMouseMoveDetect);

        return () => {
            // Clean up the listener when the component is unmounted
            window.removeEventListener('mousemove', onMouseMoveDetect);
        };
    }, []);

    useEffect(() => {
        if (!hasMouse) return; // If no mouse has been detected, exit early

        const onMouseMoveCursor = (e) => {
            const canvasContainer = document.getElementById('canvasContainer');
            if (canvasContainer && isDrawing) {
                const rect = canvasContainer.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    setCursorPos({
                        x: e.clientX - rect.left + 1, // +1 to center the cursor
                        y: e.clientY - rect.top + 2,  // +2 to center the cursor
                    });
                } else {
                    setCursorPos(null); // Hide cursor when out of bounds
                }
            }
        };

        // Add the mousemove event listener to window
        window.addEventListener('mousemove', onMouseMoveCursor);

        return () => {
            // Clean up the event listener
            window.removeEventListener('mousemove', onMouseMoveCursor);
        };
    }, [brushSize, isDrawing, hasMouse]);

    if (!cursorPos) return null; // Don't render if no cursor position is set

    return (
        <div
            style={{
                position: 'absolute',
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.5)',
                pointerEvents: 'none',
                mixBlendMode: 'difference',
                transform: 'translate(-50%, -50%)',
            }}
        />
    );
};

export default Cursor;
