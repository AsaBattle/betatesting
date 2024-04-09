// services/authService.js

import { getSession } from "next-auth/react";
import axios from 'axios';
import { serialize } from 'cookie';

const AuthService = {
  loginUser: async (req, res) => {
    // Check if the user is logged in using FullJourney's authentication
    const cookies = req.headers.cookie || '';
    try {
      const response = await axios.get('https://www.fulljourney.ai/api/auth/', {
        headers: { Cookie: cookies },
        withCredentials: true,
      });

      // If authentication is successful, serialize user data and set cookie
      const userData = response.data;
      const serializedUserCookie = serialize('user', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        path: '/',
      });

      res.setHeader('Set-Cookie', serializedUserCookie);
      return userData;
      
    } catch (error) {
      console.error('Error with FullJourney authentication:', error);
      // If FullJourney auth fails, we proceed to check for a NextAuth session
    }

    // Check if the user is logged in using NextAuth's session (Google in this case)
    const session = await getSession({ req });
    if (session) {
      // The user is logged in with NextAuth, we can return the session data
      // The session object contains a user object with the name, email, and image
      return session.user;
    }

    // If no authentication method succeeded, return null
    return null;
  },

  // ...you can add more helper functions for your authentication logic here
};

export default AuthService;
