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

      console.log("NEWsession was called with session: ", session, " and token: ", token, " and user: ", user);
      // Add the custom user ID to the session object
      session.userId = token.userId;
      return session;
    },

    async signIn({ user, account, profile, email, credentials }) {
    // Custom logic to check if the user exists in your database
    const existingUser = await findUserByNextAuthID(user.id);

    if (existingUser) {
        console.log("NEWUser found in the database with our database ID: ", existingUser.user_id);

        // User found in the database, retrieve the user ID and credits
        const userId = existingUser.user_id;
        const credits = existingUser.credits;

        // Attach the user ID and credits to the token for future reference
        user.token = {
        userId: userId,
        credits: credits,
        };
    } else {
        console.log("User not found in the database, so creating a new user");

        try {
        // Create a new customer in your database
        const response = await axios.post("https://www.fulljourney.ai/api/payment/create_customer_nextAuth", {
            email: user.email,
            nextAuthUserName: user.name,
            user_id: user.id,
        });

        // Attach the user ID and credits to the token for future reference
        user.token = {
            userId: response.data.user_id,
            credits: response.data.credits,
        };

        console.log("Response from create_customer_nextAuth: ", response.data);
        } catch (error) {
        console.log("Error from create_customer_nextAuth: ", error);
        }
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