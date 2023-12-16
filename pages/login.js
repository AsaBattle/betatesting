import { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    // Redirect to the new Discord OAuth2 login page
    window.location.href = 'http://www.fulljourney.ai/api/auth/nextjs';
  }, []);

  return null;
}