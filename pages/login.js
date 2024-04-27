import { useRef, useState, useEffect } from "react";
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';

import styles from './login.module.css';

const Login = () => {
    const router = useRouter(); 
    const { message } = router.query;
    const { data: session, status } = useSession();

    useEffect(() => {
    // check to see if the user is already logged in, if so, redirect them to the ImageMode page
    if (status === 'authenticated' && session) {

        console.log('User is already logged in, redirecting to ImageMode page');
        router.push('/ImageMode');
    }
    }, [status, session]);

    const handleFullJourneyClick = () => {
        window.location.href = 'https://www.fulljourney.ai/login';
    };

    const handleDiscordClick = () => {
        window.location.href = 'https://www.fulljourney.ai/api/auth/nextjsbeta';
    };

    const renderStatus = () => {
        if (session)
            console.log('3session:', session);
        else
            console.log('3session is null');

        if (status === 'authenticated' && session) {
            return (
              <div>
                <h1>Hi {session.user.name}</h1>
                <img src={session.user.image} alt={`${session.user.name}'s photo`} />
                <p>Signed in with: {session.user.provider}</p> {/* Provider information displayed */}
                <button onClick={() => signOut()}>Sign out</button>
              </div>
            );
        } else {
            return (
                <button className={`${styles.button} ${styles.googleButton}`} onClick={() => signIn('google')}>Login with your Google Account</button>
                // Add other provider sign-in buttons here as needed
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>FullJourney Studio</h3>
                <h3>status is: {status}</h3> {/* Optional: Display authentication status */}
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
