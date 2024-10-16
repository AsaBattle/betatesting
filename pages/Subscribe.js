import React from 'react';
import { useRouter } from 'next/router';
import styles from './Subscribe.module.css';

const Subscribe = () => {
    const router = useRouter();
    const { message } = router.query;

    const handleSubscribeClick = () => {
        window.location.href = 'https://www.craftful.ai/subscription?v123459i';
    };

    const handleCreditsClick = () => {
        window.location.href = 'https://www.craftful.ai/credits?v123459i';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>craftful Studio</h3>
            </div>
            <div className={styles.text}>
                {message && <p>{message}</p>}
            </div>
            <div className={styles.footer}>
                <button className={`${styles.button} ${styles.purchaseButton}`} onClick={handleCreditsClick}>Purchase Credits</button>
                <button className={`${styles.button} ${styles.subscribeButton}`} onClick={handleSubscribeClick}>Subscribe Now</button>
            </div>
        </div>
    );
};

export default Subscribe;