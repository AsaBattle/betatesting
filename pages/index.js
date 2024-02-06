import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function About() {
  const router = useRouter();

  useEffect(() => {
    console.log("Pushing to image mode");
    router.push('/ImageMode');
  }, []);

  return null;
}