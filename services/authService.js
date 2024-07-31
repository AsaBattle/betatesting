  // we need to check if they have an account with us, if not, we create one
  // and then we use need to modify our prediction api to make sure it's properly using the users account or at least make sure
  // thats all still working
  // Also need to create a template/default format for the user data so it's lways consistent no matter how they login

import { getSession } from "next-auth/react";
import axios from 'axios'; 
import { serialize } from 'cookie';
import alogger from '../utils/alogger';

const AuthService = {
    checkIfUserIsAlreadyLoggedIn: async (req, res) => {

    let userData = null;
    let serializedUserCookie = null;

    const cookies = req.headers.cookie || '';
    try {
      const response = await axios.get('https://www.craftful.ai/api/auth/', {
        headers: { Cookie: cookies },
        withCredentials: true,
        timeout: 5000, // Timeout set to 5000 milliseconds (5 seconds)
      });

     userData = response.data;
     serializedUserCookie = serialize('user', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        path: '/',
      });

      res.setHeader('Set-Cookie', serializedUserCookie);
      alogger('*** User IS logged in!!! with Discord cookie***');
      return userData;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error('Request timed out', error);
      } else {
        console.error('User was not logged in', error);
      }
      // If the user isn't already logged in via their discord proceed to check for a NextAuth session
    }

    console.error('*** User is not logged in ***');
    return null;
  },

  // calls our express api's endpoint/route to get the user's credits, route is getFreeUserCredits(freeUsersIpAddress) 
  // and this route will return the user's credits asoociated with the ip address, or if
  // the ip address is not found, it will create a new user with the given number of credits a free user starts with
  // and return those 
  getFreeUserCredits: async ( ipAddress ) => {
    alogger('Getting user credits for ip address:', ipAddress);
    try {
      const response = await axios.post('https://www.craftful.ai/api/auth/getFreeUserCredits', {
        ipAddress: ipAddress, 
      });

      alogger('User credits:', response);
      return response.data;
    } catch (error) {
      alogger('Error getting user credits:', error);
      return null;
    }
    return 5; // this is a placeholder for now
  }

};

export default AuthService;
