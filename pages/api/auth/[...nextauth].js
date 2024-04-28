import { Call } from '@mui/icons-material';
import axios from 'axios';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GCI,
      clientSecret: process.env.GS,
    }),
    // Add other providers as needed
  ],
  debug: true,
  secret: process.env.NEXT_AUTH_S,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Capture the Google token and user details
      if (account?.provider === 'google' && account.access_token) {
        token.access_token = account.access_token;
        token.provider = account.provider;
      }

      if (user) {
        // Pass minimal user details
        token.user_id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },

    async session({ session, token }) {
      // Attach the Google token and user details to the session
      session.access_token = token.access_token;
      session.user_id = token.user_id;
      session.email = token.email;
      session.name = token.name;

      return session;
    },

    async signIn({ user, account, profile, email, credentials }) {
      // Forward user details and Google token to your main site's API for handling user lookup or creation
      try {
        const response = await axios.post("https://www.fulljourney.ai/api/auth/nextauth", {
          user: {
            user_id: user.id,
            email: user.email,
            name: user.name
          },
          token: account.access_token  // This is the Google token
        });

        console.log("Response from /api/auth/nextauth: ", response.data);
        return response.data.success;  // Assume the main site's API responds with a success flag
      } catch (error) {
        console.error("Error from /api/auth/nextauth: ", error);
        return false;
      }
    }
  },
};


// Returns the user from the database based on the user's next auth id
async function findUserByNextAuthID(nextAuthID) {
  // Try and fetch the user via their email from your database
  let findUser = null;
  try {
    const response = await axios.get(`http://3.19.250.209:36734/user/${nextAuthID}`);
    findUser = response.data;
    findUser.user_id = findUser.user_id.toString();
  } catch (err) {
    if (!err.response || err.response.status !== 404) {
      throw err;
    }
  }
  return findUser;
}

export default NextAuth(authOptions);