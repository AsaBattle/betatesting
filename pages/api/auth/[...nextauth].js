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

        // Retrieve the user ID from your database based on the user's email or other identifier
        const userId = await getUserIdFromDatabase("test");

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

// Returns the userID from the database based on the user's user name
async function getUserIdFromDatabase(email) {
    console.log("getUserIdFromDatabase was called with email: ", email);

    let user = null;
    if ((user=findUserByEmail(email)))
        console.log("User was found in the database: ", user);
    else
        console.log("User was not found in the database");


  return 357; // Replace this with a real database query
}


async function findUserByEmail(email) {

        // Try and fetch the user via their email from our database
    let findUser;
    try 
    {
        const response = await axios.get(`http://3.19.250.209:36734/user/${email}`);
        findUser = response.data;
        findUser.user_id = findUser.user_id.toString();
    } catch (err) 
    {
        if (!err.response || err.response.status !== 404) {
            throw err;
        }
    }

    return findUser;
}

export default NextAuth(authOptions);
