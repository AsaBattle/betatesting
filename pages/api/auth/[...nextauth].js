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
        //console.log("signIn was called with user: ", user);

      // Custom logic to check if the user exists in your database
      const existingUser = await findUserByNextAuthID(user.id);

      if (existingUser) {
        console.log("User found in the database with our database ID: ", existingUser.user_id);

        // User found in the database, retrieve the user ID
        const userId = existingUser.user_id;
        // Attach the user ID to the token for future reference
        user.userId = userId;
      } else {
        console.log("User not found in the database, so creating a new user");

        try{
        // create a next customer in our database(which also creates a new stripe user connected to our database as well)
        const response = await axios.post("https://www.fulljourney.ai/api/payment/create_customer_nextAuth", 
        // the body of the request
        { 
            email: user.email, 
            nextAuthUserName: user.name,
            user_id: user.id
        });

        console.log("response from create_customer_nextAuth: ", response.data);
        } catch (error) {
            console.log("error from create_customer_nextAuth: ", error);
        }
        
        // User not found in the database, handle accordingly (e.g., create a new user)
        // You can perform additional actions or throw an error if needed
      }

      return true; // Return true to allow sign-in to proceed
    },
  },
  // Other NextAuth configuration
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