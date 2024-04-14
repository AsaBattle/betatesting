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
    async jwt({ token, account }) {
      // Persist the OAuth provider's name in the token right after signin
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log("session was called with session: ", session);
      // Add the custom user ID to the session object
      session.userId = token.userId;
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Custom logic to check if the user exists in your database
      const existingUser = await findUserByEmail(user.email);

      if (existingUser) {
        // User found in the database, retrieve the user ID
        const userId = existingUser.user_id;
        // Attach the user ID to the token for future reference
        user.userId = userId;
      } else {
        // User not found in the database, handle accordingly (e.g., create a new user)
        // You can perform additional actions or throw an error if needed
        console.log("User not found in the database");
      }

      return true; // Return true to allow sign-in to proceed
    },
  },
  // Other NextAuth configuration
};

// Returns the user from the database based on the user's email
async function findUserByEmail(email) {
  // Try and fetch the user via their email from your database
  let findUser = null;
  try {
    const response = await axios.get(`http://3.19.250.209:36734/user/${email}`);
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