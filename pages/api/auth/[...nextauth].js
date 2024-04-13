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
    async session({ session, token }) {

        // Retrieve the user ID from your database based on the user's email or other identifier
        const userId = await getUserIdFromDatabase(user.email);

        // Forward the provider's name to the session object
        if (token.provider) {
            session.user.provider = token.provider;
        }

        // Add the custom user ID to the session object
        session.userId = userId;

        return session;
    },
  },
  // Other NextAuth configuration
};

// Returns the userID from the database based on the user's email
async function getUserIdFromDatabase(email) {
  return 357; // Replace this with a real database query
}

export default NextAuth(authOptions);
