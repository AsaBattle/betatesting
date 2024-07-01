import { FaUser, FaLock, FaDiscord, FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { GiJourney } from "react-icons/gi";
import { useState,useEffect } from "react";
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn as nextAuthSignIn, signOut, getSession } from 'next-auth/react';
import axios from 'axios';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { fauth } from '../utils/firebase';


import styles from './signupform.module.css';
import { set } from 'lodash';


const SignUpForm = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [mainPromptText, setMainPromptText] = useState('Sign Up');
    const [verifyEmail, setVerifyEmail] = useState(false);
    const [showInputs, setShowInputs] = useState(true);
    const [userCredential, setUserCredential] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const MainPrompt = () => {

        if (!verifyEmail) {
            return (
                <h1 className={styles['poppins-bold']}>{mainPromptText}</h1>
            );
        } else {
            return (
                <div>
                    <h1 className={styles['poppins-bold']}>{mainPromptText}</h1>
                    <button className={styles.verifyButton} onClick={checkEmailVerification}> I verified my email </button>
                </div>
            );
        }
    }
    
    useEffect(() => {
        if (status === 'authenticated' && session) {
            console.log('User is logged in.');
            router.push('/ImageMode');
        }
        console.log('Status: ', status);
    }, [status, session, router]);

    
    const ReCheckEmailVerification = async () => {
        console.log('Checking email verification status AGAIN...');

        let result = null;
        await userCredential.reload();
        if (userCredential.emailVerified) {
            console.log('User email is NOW VERIFIED');
            result = await AttemptCredentialsLogin();
        } else {
            console.log('User email is STILL not verified');
        }
    };

    const checkEmailVerification = async (user) => {
        console.log('Checking email verification status...');
        await user.reload();
        if (user.emailVerified) {
            console.log('User email is verified');
           AttemptCredentialsLogin();
        } else {
            console.log('User email is not verified');
            setTimeout(() => checkEmailVerification(user), 5000);
        }
    };


    const AttemptCredentialsLogin = async () => {
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

        return result;
    }
    

    const handleSignUp = async () => {
        console.log("SignUp Clicked");
        if (password && email) {

            setShowInputs(false);
            try {
                const userCredential = await createUserWithEmailAndPassword(fauth, email, password);
                setUserCredential(userCredential);
                const user = userCredential.user;
                console.log('Firebase user created successfully:', user);

                await sendEmailVerification(user)
                .then(() => {
                    console.log("Email verification was sent!");
                })

                //setMainPromptText('Email Verification Sent! Please verify your email address');
                setMainPromptText('We Sent You A Verification Email. Please go open it and verify to continue.');
                setVerifyEmail(true);

                // Start checking for email verification
                checkEmailVerification(user);
            } catch (error) {
                console.error("Error creating user:", error);
                setMainPromptText(error.message);
                alert("Failed to create user: " + error.message);
            }
        } else {
            console.log("SignUp cancelled. Make sure all fields are filled.");
        }
    };

    // Once the user is authenticated, make an API call to our Express server to authenticate the user there or create a new user(if needed)
    useEffect(() => {
        const fetchSessionAndAuthenticate = async () => {
            const session = await getSession();
            console.log("Session obtained post sign-up:", session);
            if (session) {
                // Now make the API call to your Express server
                try {
                    const response = await axios.post("https://www.craftful.ai/api/auth/nextauth", {
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
            {MainPrompt()}
    
            {showInputs && (
              <form action="" onSubmit={(e) => {
                e.preventDefault();
                handleSignUp();
              }}>
                <div className={styles.inputBox}>
                  <input
                    type="text"
                    placeholder="Email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FaUser className={styles.icon} />
                  <FaUser className={styles.icon} />
                </div>
                <div className={`${styles.inputBox} relative`}>
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
                <button type="submit">SignUp</button>
              </form>
            )}
          </div>
        </div>
      );
};

export default SignUpForm;