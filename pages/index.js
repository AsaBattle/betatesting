import { useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './index.module.css';

export default function About() {
  const router = useRouter();

  useEffect(() => {
    console.log("Pushing to image mode");
    router.push('/ImageMode');
  }, []);

  return (
    <div className={styles.container}>
        <div className={styles.header}>
            <h1>Welcome to CraftFul Studio</h1>
        </div>
    </div>
);
}