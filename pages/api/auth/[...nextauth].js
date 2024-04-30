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
        // Attach only necessary data to token
        if (account?.provider === 'google') {
            token.accessToken = account.access_token;
        }
        if (user) {
            token.user = { id: user.id, email: user.email, name: user.name };
        }
        return token;
    },

    async session({ session, token }) {
        // Append data to session object
        session.user = token.user;
        session.accessToken = token.accessToken;
        return session;
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