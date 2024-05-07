import { useRef, useState, useEffect } from "react";
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn as nextAuthSignIn, signOut, getSession } from 'next-auth/react';
import axios from 'axios';

import styles from './login.module.css';

const Login = () => {
    const router = useRouter();
    const { message } = router.query;
    const { data: session, status } = useSession();

    useEffect(() => {
        // Check to see if the user is already logged in, if so, redirect them to the ImageMode page
        if (status === 'authenticated' && session) {
            console.log('User is already logged in, redirect ing to ImageMode page');
            router.push('/ImageMode');
        }

        console.log("Status: ", status);
        
    }, [status, session]);

    const handleFullJourneyClick = () => {
        window.location.href = 'https://www.fulljourney.ai/login';
    };

    const handleDiscordClick = () => {
        window.location.href = 'https://www.fulljourney.ai/api/auth/nextjsbeta';
    };

    const handleGoogleSignIn = async () => {
        // This function will be invoked when the Google login button is clicked
       // try {
            const result = await nextAuthSignIn('google', { redirect: false });
            if (result.url) {
                // Redirect user to the NextAuth callback URL to handle session creation
                window.location.href = result.url;
            } else {
                console.error("SignIn did not result in redirection. This could indicate a configuration issue.");
            }
       // } catch (error) {
       //     console.error("Error during sign-in:", error);
       // }
    };

    const renderStatus = () => {
        if (status === 'authenticated' && session) {
            return (
              <div>
                <h1>Hi {session.user.name}</h1>
                <img src={session.user.image} alt={`${session.user.name}'s photo`} />
                <p>Signed in with: {session.user.provider}</p> 
                <button onClick={() => signOut()}>Sign out</button>
              </div>
            );
        } else {
            return (
                <button className={`${styles.button} ${styles.googleButton}`} onClick={handleGoogleSignIn}>Login with your Google Account</button>
                // Add other provider sign-in buttons here as needed
            );
        }
    };

    useEffect(() => {
        const fetchSessionAndAuthenticate = async () => {
            const session = await getSession();
            console.log("Session obtained post sign-in:", session);
    
            if (session) {
                // Now make the API call to your Express server
                try {
                    const response = await axios.post("https://www.fulljourney.ai/api/auth/nextauth", {
                        user: {
                            user_id: session.user.id,
                            email: session.user.email,
                            name: session.user.name
                        },
                        token: session.accessToken  // Assuming your session object includes the accessToken
                    }, { withCredentials: true });
    
                    console.log("Response from API:", response.data);
                    if (response.data.success) {
                        // Additional logic if needed based on successful authentication
                        window.location.href = '/ImageMode';  // Redirect or handle the response
                    }
                } catch (error) {
                    console.error("Error during API call to authenticate user:", error);
                }
            }
        };
    
        if (status === 'authenticated') {
            fetchSessionAndAuthenticate();
        }
    }, [status]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>dFullJourney Studio</h3>
                <h3>Status is: {status}</h3> {/* Optional: Display authentication status */}
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
