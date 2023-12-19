import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Auth({ isAuthenticated }) {
  const router = useRouter();

  useEffect(() => {
    console.log("Inside useEffect in Auth.js isAuthenticated: " + isAuthenticated);

    // Redirect based on the authentication status
    if (isAuthenticated) {
      router.push('/paint');
    } else {
      router.push('/login');
    }
  }, [router, isAuthenticated]);

  return null;
}

export async function getServerSideProps(context) {
  const { req } = context;
  const userSessionCookie = req.cookies['discord.oauth2']; // Replace with your actual session cookie name

  if (userSessionCookie) {
    // If there is a session cookie, consider the user as authenticated
    return {
      props: {
        isAuthenticated: true,
      },
    };
  }

  // If there is no session cookie, consider the user as not authenticated
  return {
    props: {
      isAuthenticated: true,
    },
  };
}
