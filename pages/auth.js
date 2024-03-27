import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { setUserIsLoggedInWithAccount } from '../redux/slices/toolSlice';

export default function Auth({ isAuthenticated }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect based on the authentication status
    if (isAuthenticated) {
      console.log('------------------Auth: isAuthenticated is true-----------------');
      dispatch(setUserIsLoggedInWithAccount(true));
      router.push('/ImageMode');
    } else 
    if (process.env.NEXT_PUBLIC_WORKING_LOCALLY === 'true') {
      router.push('/ImageMode');
    }
    else {
      console.log('------------------Auth: isAuthenticated is FALSE!!!!!!!-----------------');
      dispatch(setUserIsLoggedInWithAccount(true));
      
      router.push('/login');
    }
  }, [router, isAuthenticated]);

  return null;
}

export async function getServerSideProps(context) {
  // If there is no session cookie, consider the user as not authenticated
  return {
    props: {
      isAuthenticated: true,
    },
  };
}
