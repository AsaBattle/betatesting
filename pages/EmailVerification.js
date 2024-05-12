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


import styles from './emailverification.module.css';

const EmailVerification = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    // Check to see if the user is already logged in, if so, redirect them to the ImageMode page
    useEffect(() => {
        if (status === 'authenticated' && session) {
            console.log('User is logged in.');
            router.push('/ImageMode');
        } 
        console.log("Status: ", status);

    }, [status, session]);



    const handleSignUp = async () => {
        console.log("SignUp Clicked");
    };


    return (
        <div className={styles.body}>
            <div className={styles.wrapper}>
                <h1 className={styles['poppins-bold']}>Please Verify You Email Address To Login</h1>
            </div>
        </div>
    );
};

export default EmailVerification;
