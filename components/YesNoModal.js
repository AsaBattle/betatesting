import React from 'react';
import { Button, Modal } from '@mui/material';

function YesNoModal({ open, onClose, onYes, onNo, title, message }) {
    const handleYes = () => {
        onYes();
        onClose();
    };
    
    const handleNo = () => {
        onNo();
        onClose();
    };
    
    return (
        <Modal open={open} onClose={onClose}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '16px', borderRadius: '4px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <h2>{title}</h2>
                <p>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleNo}>No</Button>
                    <Button onClick={handleYes}>Yes</Button>
                </div>
            </div>
        </Modal>
    );
}

export default YesNoModal;