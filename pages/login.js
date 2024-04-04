import React from 'react';
import { useRouter } from 'next/router';
import styles from './login.module.css';

const Login = () => {
    const router = useRouter();
    const { message } = router.query;

    const handleFullJourneyClick = () => {
        window.location.href = 'https://www.fulljourney.ai/login';
    };

    const handleGoogleClick = () => {
        window.location.href = 'https://www.google.com/accounts/o8/id';
    };

    const handleDiscordClick = () => {
        window.location.href = 'https://www.fulljourney.ai/api/auth/nextjsbeta';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>FullJourney Studio</h3>
            </div>
            <div className={styles.text}>
                <p>{message}</p>
            </div>
            <div className={styles.footer}>
                <button className={`${styles.button} ${styles.fulljourneyButton}`} onClick={handleFullJourneyClick}>Login with your FullJourney.Ai account</button>
                <button className={`${styles.button} ${styles.googleButton}`} onClick={handleGoogleClick}>Login with your Google Account</button>
                <button className={`${styles.button} ${styles.discordButton}`} onClick={handleDiscordClick}>Login with your Discord account</button>
            </div>
        </div>
    );
};

export default Login;