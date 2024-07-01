import { useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './index.module.css';

export default function About() {
  const router = useRouter();

  useEffect(() => {
    console.log("Pushing to image mode");
    console.log('The Current Build Commit SHA:', process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA);
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