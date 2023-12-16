import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Auth() {
  const router = useRouter();

  useEffect(() => {
    // Get the user object from the query parameters
    const user = router.query.user;
    const code = router.query.code;

    if (user && code) {
        console.log("Setting local storage to user: " + user + " and code: " + code);

      // Save the user object and the code in the local storage
      localStorage.setItem('user', user);
      localStorage.setItem('code', code);

      // Redirect the user to the dashboard page
      //router.push('/paint');
    }
  }, [router]);

  return null;
}