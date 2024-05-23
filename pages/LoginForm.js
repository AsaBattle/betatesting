import Head from "next/head";
import { FaUser, FaLock, FaDiscord, FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { GiJourney } from "react-icons/gi";
import { useState,useEffect } from "react";
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn as nextAuthSignIn, signOut, getSession } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { fauth } from '../utils/firebase';


import styles from './loginform.module.css';

const LoginForm = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(false);
    const [mainPromptText, setMainPromptText] = useState('Login');
    const [mainPromptColor, setMainPromptColor] = useState('white');
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const { error } = router.query;
        if (error) {
          setErrorMessage("Invalid username or password. Please try again.");
        }
        console.log("Error: ", error);
      }, [router.query]);


      const checkEmailVerification = async (user) => {
        console.log('Checking email verification status...');
        await user.reload();
        if (user.emailVerified) {
            console.log('User email is verified');
            const result = await nextAuthSignIn('credentials', {
                redirect: false,
                email: email,
                password: password,
            });
            if (result.error) {
                console.error('Error logging in:', result.error);
            } else if (result.url) {
                window.location.href = result.url;
            } else {
                console.error('SignIn did not result in redirection');
            }
        } else {
            console.log('User email is not verified');
            setTimeout(() => checkEmailVerification(user), 5000);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session) {
            console.log('User is logged in.');
            router.push('/ImageMode');
        } 
        console.log("Status: ", status);     
    }, [username, password, status, session]);

    const handleFullJourneyClick = () => {
        window.location.href = 'https://www.fulljourney.ai/login';
    };

    const handleDiscordClick = () => {
        console.log("Discord Sign In Clicked");
        window.location.href = 'https://www.fulljourney.ai/api/auth/nextjsbeta';
    };

  const handleGoogleSignIn = async () => {
    let result = null;
        console.log("Google Sign In Clicked");
        // This function will be invoked when the Google login button is clicked
        try {
            result = await nextAuthSignIn('google', { redirect: false });
            if (result.url) {
                console.log("Redirecting to NextAuth callback URL to handle session creation: ", result.url);
                // Redirect user to the NextAuth callback URL to handle session creation
                window.location.href = result.url;
            } else {
                console.error("SignIn did not result in redirection. This could indicate a configuration issue.");
            }
        } catch (error) {
            console.error("Error during sign-in:", error, " Result: ", result);
        }
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem('FullJourneyUserName');
        const storedPassword = localStorage.getItem('FullJourneyPassword');
        
        console.log("Stored Username: ", storedUsername);
        console.log("Stored Password: ", storedPassword);

        setIsChecked(storedUsername || storedPassword);
        if (storedUsername) {
            setUsername(storedUsername);
        }
        if (storedPassword) {
            setPassword(storedPassword);
        }
    }, []);

    
    const handleFirebaseSignIn = async () => {
        console.log("Firebase Sign In Clicked");
        if (username && password) {
            const result = await nextAuthSignIn('credentials', {
                redirect: false,
                email: username,
                password
            });
            if (result.error) {
                if (result.error === 'Email not verified') {
                    setAwaitingEmailVerification(true);
                    checkEmailVerification();
                } else
                if (result.error === 'Invalid email') {
                    setMainPromptColor('red');
                    setMainPromptText('Invalid email. Please try again.');
                } else
                if (result.error === 'Bad username or password') {
                    setMainPromptColor('red');
                    setMainPromptText('Invalid username or password. Please try again.');
                }
                else
                    alert("This is the error '" + result.error + "'");
                
            } else if (result.url) {
                window.location.href = result.url;
            } else {
                console.error("SignIn did not result in redirection. This could indicate a configuration issue.");
            }
        } else {
            console.log("Authentication cancelled.");
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





    const handleRememberMe = (event) => {
        console.log("Remember Me Clicked and isChecked: ", event.target.checked);
        const isChecked = event.target.checked;
        setIsChecked(isChecked);
      
        if (isChecked) {
          localStorage.setItem('FullJourneyUserName', username);
          localStorage.setItem('FullJourneyPassword', password);
        } else {
          localStorage.removeItem('FullJourneyUserName');
          localStorage.removeItem('FullJourneyPassword');
        }
      };

    const MainPrompt = () => {

        if (awaitingEmailVerification) {
            return (
                <div className={styles.awaitingEmailVerification}>
                    <h1>Email Verification Required</h1>
                    <p>Please check your email to verify your account.</p>
                </div>
            );
        } else {
        return (
            <h1 className={styles['poppins-bold']} style={{ color: mainPromptColor }}>{mainPromptText}</h1>        );
        }
    }


    return (
        <div className={styles.body}>
            <Head>
                <title>FullJourney.AI Studio Beta4 Login</title>
                <meta name="viewport" content="initial-scale=0.7, width=device-width user-scalable=no" />
            </Head>
            <div className={styles.wrapper}>
                {MainPrompt()}
                <form action="" onSubmit={(e) => {
                    e.preventDefault();
                    handleFirebaseSignIn();
                }}>
                    <div className={styles.inputBox}>
                        <input
                            type="text"
                            placeholder="Username"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <FaUser className={styles.icon} />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FaLock className={styles.icon} />
                        {showPassword ? (
                            <FaRegEye
                            className={`${styles.eyeIcon} ${styles.clickableIcon}`}
                            onClick={() => setShowPassword(!showPassword)}
                            />
                        ) : (
                            <FaRegEyeSlash
                            className={`${styles.eyeIcon} ${styles.clickableIcon}`}
                            onClick={() => setShowPassword(!showPassword)}
                            />
                        )}
                    </div>
                    <div className={styles.rememberForgot}>
                        <label>
                            <input 
                                type="checkbox" 
                                autoComplete="on"
                                checked={isChecked}
                                onChange={handleRememberMe}
                            />
                            Remember Me
                        </label>
                        <Link href="/ForgotPassword">Forgot Password?</Link>
                    </div>
                    <button type="submit">Login</button>

                    <div className={styles.orUse}>
                        <p>- OR -</p>
                    </div>
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
                    <div className={styles.registerLink}>
                        <p>{"Don't have an account?"} <Link href="/SignUpForm"><a>Register</a></Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
