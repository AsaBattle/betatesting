import { FaUser, FaLock, FaDiscord } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useEffect } from "react";
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn as nextAuthSignIn, signOut, getSession } from 'next-auth/react';
import axios from 'axios';

import styles from './loginform.module.css';


const LoginForm = () => {
    const router = useRouter();
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
        console.log("Discord Sign In Clicked");
        window.location.href = 'https://www.fulljourney.ai/api/auth/nextjsbeta';
    };

    const handleGoogleSignIn = async () => {
        console.log("Google Sign In Clicked");
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
    <div className={styles.body}>
        <div className={styles.wrapper}>
        <h1 className={styles['poppins-bold']}>Login</h1>
            <div className={styles.socialLogin}>
            <div className={styles.socialButtons}>
            <button className={styles.discordBtn} onClick={handleDiscordClick}>
                <FaDiscord className={styles.icon} />
                Discord
            </button>
            <button className={styles.googleBtn} onClick={handleGoogleSignIn}>
                <FcGoogle className={styles.icon} />
                Google
            </button>
            </div>
            </div>
           {/*} <form action="">
                <div className={styles.inputBox}>
                <input type="text" placeholder="Username" autoComplete="username"/>
                <FaUser className={styles.icon} />
                </div>
                <div className={styles.inputBox}>
                <input type="password" placeholder="Password" autoComplete="current-password"/>
                <FaLock className={styles.icon} />
                </div>
            

                <div className={styles.rememberForgot}>
                <label><input type="checkbox" autoComplete="on"/>Remember Me</label>
                <a href="#">Forgot Password</a>
                </div>
                <button type="submit">Login</button>    
                <div className={styles.registerLink}>
                <p>{"Don't have an account?"} <a href="#">Register</a></p>
                </div>
            </form>*/}
        </div>
    </div>
  );
};


 

export default LoginForm;
