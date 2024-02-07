import { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    // Redirect to the new Discord OAuth2 login page
    window.location.href = 'https://www.fulljourney.ai/api/auth/nextjsbeta';
  }, []);

  return null;
}