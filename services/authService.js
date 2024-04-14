  // we need to check if they have an account with us, if not, we create one
  // and then we use need to modify our prediction api to make sure it's properly using the users account or at least make sure
  // thats all still working
  // Also need to create a template/default format for the user data so it's lways consistent no matter how they login

import { getSession } from "next-auth/react";
import axios from 'axios';
import { serialize } from 'cookie';

const AuthService = {
    checkIfUserIsAlreadyLoggedIn: async (req, res) => {
    // *** DISCORD LOGIN check ***
    // Check if the user is logged in using FullJourney's(Discord) authentication
    const cookies = req.headers.cookie || '';
    try {
      const response = await axios.get('https://www.fulljourney.ai/api/auth/', {
        headers: { Cookie: cookies },
        withCredentials: true,
      });

      // If authentication was successful(meaning the user had already logged into their discord acocount via fj's login process), 
      // Then we serialize the user data and create a cookie with it
      const userData = response.data;
      const serializedUserCookie = serialize('user', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        path: '/',
      });

      res.setHeader('Set-Cookie', serializedUserCookie);
      console.error('*** User IS logged in!!! with Discord cookie***');
      return userData;
    } catch (error) {
      console.error('User was not logged in via Fulljourneys discord login process', error);
      // If the user isn't already logged in via their discord proceed to check for a NextAuth session
    }

    // *** NEXTAUTH LOGIN check ***
    // Check if the user is logged through a NextAuth's session
    // This could have been any of the providers we offer on our login screen(Right now it's just Google)
    const session = await getSession({ req });
    if (session) {
      // The user is logged in with NextAuth, we can return the session data
      // The session object contains a user object with the name, email, and image
      console.error('*** User IS logged in!!! With nextauthsession ***');
      return session.user;
    }
    
    // If no authentication method succeeded, return null
    console.error('*** User is not logged in ***');
    return null;
  },
};

export default AuthService;
