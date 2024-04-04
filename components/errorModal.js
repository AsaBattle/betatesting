import React from 'react';
import styles from './errorModal.module.css';
import { useRouter } from 'next/router';

function ErrorModal({ error, onClose }) {
    const router = useRouter();

    if (!error) {
        return null;
    }

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        if (error.route) {
            router.push(error.route);
        }
    };

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <h2>Error</h2>
                <p>{error.message}</p>
                <button className={styles.dismissButton} onClick={handleClose}>Dismiss</button>
            </div>
        </div>
    );
}

export default ErrorModal;