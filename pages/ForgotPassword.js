import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { fauth } from '../utils/firebase';

import styles from './forgotpassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('Enter your email to reset your password');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(fauth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      setMessage('Error sending password reset email. Please enter a valid email address');
      console.error('Error sending password reset email:', error);
    }
  };

  return (
    <div className={styles.body}>
        <div className={styles.wrapper}>
            <h2 className={styles['poppins-bold']}>Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
                <div className={styles.inputBox}>
                    {message && <p>{message}</p>}
                    <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit">Reset Password</button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ForgotPassword;