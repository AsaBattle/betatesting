import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';

import styles from './login.module.css';

const Login = () => {
    const router = useRouter(); 
    const { message } = router.query;
    const { data, status } = useSession();

    const handleFullJourneyClick = () => {
        window.location.href = 'https://www.fulljourney.ai/login';
    };

    const handleDiscordClick = () => {
        window.location.href = 'https://www.fulljourney.ai/api/auth/nextjsbeta';
    };

    const renderStatus = () => {
        if (status === 'authenticated') {
            return (
              <div>
                <h1> hi {data.user.name}</h1>
                <img src={data.user.image} alt={data.user.name + ' photo'} />
                <button onClick={signOut}>sign out</button>
              </div>
            );
        } else {
            return (
                <button className={`${styles.button} ${styles.googleButton}`} onClick={() => signIn('google')}>Login with your Google Account</button>
            );
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>FullJourney Studio</h3>
            </div>
            <div className={styles.text}>
                <p>{message}</p>
            </div>
            <div className={styles.footer}>
                {renderStatus()}
                <button className={`${styles.button} ${styles.fulljourneyButton}`} onClick={handleFullJourneyClick}>Login with your FullJourney.Ai account</button>
                <button className={`${styles.button} ${styles.discordButton}`} onClick={handleDiscordClick}>Login with your Discord account</button>
            </div>
        </div>
    );
};

export default Login;