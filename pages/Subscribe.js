import React from 'react';
import styles from './Subscribe.module.css';

const Subscribe = () => {
    const handleSubscribeClick = () => {
        window.location.href = 'https://www.fulljourney.ai/subscription?v123459i';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Welcome to FullJourney Studio</h1>
            </div>
            <div className={styles.text}>
                <p>To use this service, you must be an active subscriber of FullJourney.</p>
            </div>
            <div className={styles.footer}>
                <button className={styles.subscribeButton} onClick={handleSubscribeClick}>Subscribe Now</button>
            </div>
        </div>
    );
};

export default Subscribe;