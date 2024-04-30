import { useRef, useState, useEffect } from "react";
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn as nextAuthSignIn, signOut } from 'next-auth/react';
import axios from 'axios';

import styles from './login.module.css';

const Login = () => {
    const router = useRouter();
    const { message } = router.query;
    const { data: session, status } = useSession();

    useEffect(() => {
        // Check to see if the user is already logged in, if so, redirect them to the ImageMode page
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

    const handleGoogleSignIn = async () => {
        // This function will be invoked when the Google login button is clicked
        const result = await nextAuthSignIn('google', { redirect: false, callbackUrl: "/ImageMode" });
        console.log("NextAuth sign-in result:", result);
        if (result?.url) {
            // Perform API call to your Express API with the received session data
            try {
                const response = await axios.post("https://www.fulljourney.ai/api/auth/nextauth", {
                    user: {
                        user_id: result.user.id,
                        email: result.user.email,
                        name: result.user.name
                    },
                    token: result.user.access_token  // Assuming this is available; adjust according to your token setup
                }, { withCredentials: true });
    
                if (response.data.success) {
                    console.log("Authentication successful", response.data);

                        // If authentication is successful, set a test session value
                        const sessionResponse = await axios.get("https://www.fulljourney.ai/api/auth/set-test", {
                            withCredentials: true  // Ensure credentials are sent with the request
                        });
            
                        console.log("Session test set response: ", sessionResponse.data);
            
                        // Retrieve the test session value to confirm persistence
                        const testSessionResponse = await axios.get("https://www.fulljourney.ai/api/auth/get-test", {
                            withCredentials: true
                        });
            
                        console.log("Session test get response: ", testSessionResponse.data);

                    // Additional steps as needed
                    window.location.href = response.data.redirectUrl || '/ImageMode';
                } else {
                    console.error("External API authentication failed:", response.data);
                }

            } catch (error) {
                console.error("Error during external API authentication:", error);
            }
        } else {
            console.error("Error during NextAuth sign-in:", result);
        }
    };

    const renderStatus = () => {
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
                <button className={`${styles.button} ${styles.googleButton}`} onClick={handleGoogleSignIn}>Login with your Google Account</button>
                // Add other provider sign-in buttons here as needed
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>cFullJourney Studio</h3>
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
