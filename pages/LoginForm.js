import React from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import styles from './loginform.module.css';

const LoginForm = () => {
   
return (
    <div className={styles.body}>
    <div className={styles.wrapper}>
      <form action="">
      <h1 className={styles['poppins-bold']}>Login</h1>
        <div className={styles.inputBox}>
          <input type="text" placeholder="Username" required />
          <FaUser className={styles.icon} />
        </div>
        <div className={styles.inputBox}>
          <input type="password" placeholder="Password" required />
          <FaLock className={styles.icon} />
        </div>
        <div className={styles.rememberForgot}>
          <label><input type="checkbox" />Remember Me</label>
          <a href="#">Forgot Password</a>
        </div>
        <button type="submit">Login</button>    
        <div className={styles.registerLink}>
          <p>Don't have an account? <a href="#">Register</a></p>
        </div>
      </form>
    </div>
    </div>
  );
};


 

export default LoginForm;
