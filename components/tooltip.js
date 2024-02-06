import React, { useState, useRef } from 'react';

const Tooltip = ({ children, text }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const timeoutIdRef = useRef(null);

    const handleMouseEnter = () => {
        // Clear any existing timeouts to prevent multiple tooltips
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }
        
        // Set a timeout to show the tooltip after a delay
        timeoutIdRef.current = setTimeout(() => {
            setShowTooltip(true);
        }, 750);
    };

    const handleMouseLeave = () => {
        // Clear the timeout if the mouse leaves before the tooltip is shown
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }
        setShowTooltip(false);
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="tooltip-container"
            style={{ position: 'relative' }}
        >
            {children}
            {showTooltip && (
                <div
                    className="tooltip-text"
                    style={{
                        visibility: 'visible',
                        position: 'absolute',
                        zIndex: 1,
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '5px',
                        backgroundColor: 'black',
                        color: 'white',
                        padding: '5px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

Tooltip.displayName = 'Tooltip'; // Add display name here

export default Tooltip;
