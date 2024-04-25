/*
just copied over this signIn code(and the rest of the entire file from Claude)
 I also wrote out the nextAuth routes in the Express api as well as the nextAuth strategy.
 Next we need to test if this works. Also, with the discord login strategy, we do all the user login and creation
 in the strategy itself. So I don't think We need to be doing that here. We just need to pass the token to the main site.
 But lets test this first. Also, will we need to serialize/deserialize the user data in the Express api strategy just like we did in the discord login strategy?
*/
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
    async signIn({ user, account, profile, email, credentials }) {
        // Custom logic to check if the user exists in your database
        const existingUser = await findUserByNextAuthID(user.id);
      
        if (existingUser) {
          console.log("2NEWUser found in the database with our database ID: ", existingUser.user_id);
          // User found in the database, retrieve the user ID and credits
          const user_id = existingUser.user_id;
          const credits = existingUser.credits;
      
          // Attach the user ID and credits to the user object
          user.user_id = user_id;
          user.credits = credits;
        } else {
          console.log("User not found in the database, so creating a new user");
          try {
            // Create a new customer in your database
            const response = await axios.post("https://www.fulljourney.ai/api/payment/create_customer_nextAuth", {
              email: user.email,
              nextAuthUserName: user.name,
              user_id: user.id,
            });
      
            // Attach the user ID and credits to the user object
            user.user_id = response.data.user_id;
            user.credits = response.data.credits;
      
            console.log("Response from create_customer_nextAuth: ", response.data);
          } catch (error) {
            console.log("Error from create_customer_nextAuth: ", error);
          }
        }
      
        return true; // Return true to allow sign-in to proceed
      },
      
      async jwt({ token, user, account, profile, isNewUser }) {
        // Include the user data in the token
        if (user) {
          token.user_id = user.user_id;
          token.credits = user.credits;
          token.name = user.name;
        }
      
        return token;
      },
      
      async session({ session, token, user }) {
        // Include the token in the session
        session.token = token;
      
        return session;
      },
      
      async redirect({ url, baseUrl }, { token }) {
        // Pass the token to the main site upon successful login
        if (url === baseUrl) {
          const redirectUrl = `https://www.fulljourney.ai/api/auth/nextauth?token=${encodeURIComponent(token)}`;
          return redirectUrl;
        }
      
        // Return the original URL if it's not the base URL
        return url;
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