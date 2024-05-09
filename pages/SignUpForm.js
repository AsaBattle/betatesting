import { FaUser, FaLock, FaDiscord } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { GiJourney } from "react-icons/gi";
import { useState,useEffect } from "react";
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn as nextAuthSignIn, signOut, getSession } from 'next-auth/react';
import axios from 'axios';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { fauth } from '../utils/firebase';


import styles from './signupform.module.css';

const SignUpForm = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');


    useEffect(() => {
        // Check to see if the user is already logged in, if so, redirect them to the ImageMode page
        if (status === 'authenticated' && session) {
            console.log('User is logged in.');
            router.push('/ImageMode');
        } 
        console.log("Status: ", status);

    }, [status, session]);



    const handleSignUp = async () => {
        console.log("SignUp Clicked");
        if (username && password && email) {
            try {
                const userCredential = await createUserWithEmailAndPassword(fauth, email, password);
                const user = userCredential.user;
                console.log('Firebase user created successfully:', user);
    
                // After successful registration, sign in the user with NextAuth
                const result = await nextAuthSignIn('credentials', {
                    redirect: false,
                    email: email,
                    password: password
                });
                if (result.url) {
                    console.log("Redirecting to NextAuth callback URL:", result.url);
                    router.push(result.url); // Use Next.js router to redirect
                } else {
                    console.error("NextAuth sign-in did not result in redirection.");
                }
            } catch (error) {
                console.error("Error creating user:", error);
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
                <h1 className={styles['poppins-bold']}>Sign Up</h1>
              
                <form action="" onSubmit={(e) => {
                    e.preventDefault();
                    handleSignUp();
                }}>
                    <div className={styles.inputBox}>
                        <input
                            type="text"
                            placeholder="Name"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <FaUser className={styles.icon} />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            type="text"
                            placeholder="Email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <FaUser className={styles.icon} />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FaLock className={styles.icon} />
                    </div>
                    <button type="submit">SignUp</button>
                </form>
            </div>
        </div>
    );
};

export default SignUpForm;