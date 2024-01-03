import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Auth({ isAuthenticated }) {
  const router = useRouter();

  useEffect(() => {
    console.log("Inside useEffect in Auth.js isAuthenticated: " + isAuthenticated);
    console.log("Inside useEffect in Auth.js isAuthenticated: " + isAuthenticated);
    console.log("Working locally: " + process.env.NEXT_PUBLIC_WORKING_LOCALLY);
    
    // Redirect based on the authentication status
    if (isAuthenticated) {
      console.log("Going too /paint because isAuthenticated is true: " + isAuthenticated);
      router.push('/paint');
    } else 
    if (process.env.NEXT_PUBLIC_WORKING_LOCALLY === 'true') {
      console.log("Going to /paint because process.env.NEXT_PUBLIC_WORKING_LOCALLY is true: " + process.env.NEXT_PUBLIC_WORKING_LOCALLY);
      router.push('/paint');
    }
    else {
      router.push('/login');
    }
  }, [router, isAuthenticated]);

  return null;
}

export async function getServerSideProps(context) {
  /*
  const { req } = context;
  const userSessionCookie = req.cookies['discord.oauth2']; // Replace with your actual session cookie name

  console.log("Inside getServerSideProps in Auth.js userSessionCookie: " + userSessionCookie);
  if (userSessionCookie) {
    // If there is a session cookie, consider the user as authenticated
    return {
      props: {
        isAuthenticated: true,
      },
    };
  }
*/
  // If there is no session cookie, consider the user as not authenticated
  return {
    props: {
      isAuthenticated: true,
    },
  };
}
