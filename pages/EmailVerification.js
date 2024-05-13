import { useState,useEffect } from "react";
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, getSession } from 'next-auth/react';
import { sendEmailVerification } from 'firebase/auth';
import { fauth } from '../utils/firebase';
import styles from './EmailVerification.module.css';

const EmailVerification = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    // Check to see if the user is already logged in, if so, redirect them to the ImageMode page
    useEffect(() => {
        if (status === 'authenticated' && session) {
            console.log('User is logged in.');
            router.push('/ImageMode');
        } 
        console.log("Status: ", status);

    }, [status, session]);

    const SendVerificationEmail = async () => {
        console.log("Verification email sent, awaiting reply ...");
        // Add your email verification logic here

        
    };
    return (
        <div className={styles.body}>
            <div className={styles.wrapper}>
                <div className={styles.logo}>
                    <img src="/favicon.png" alt="FullJourney.ai Logo" />
                </div>
                <h1 className={styles['poppins-bold']}>Verify your email address</h1>
                <p className={styles['poppins-regular']}>In order to start using your FullJourney.ai account, you need to confirm your email address.</p>
                <button className={styles.verifyButton} onClick={SendVerificationEmail}>
                   Send Email Verification
                </button>
                <p className={styles.note}>If you did not get an email verification yet, please click above to send one</p>
            </div>
        </div>
    );
};

export default EmailVerification;