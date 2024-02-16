import React from 'react';
import styles from './errorModal.module.css';

function ErrorModal({ error, onClose }) {
    if (!error) {
        return null;
    }

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <h2>Error</h2>
                <p>{error}</p>
                <button className={styles.dismissButton} onClick={onClose}>Dismiss</button>
            </div>
        </div>
    );
}

export default ErrorModal;