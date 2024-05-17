import axios from 'axios';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { fauth } from '../../../utils/firebase'; // Make sure this path is correctly pointing to your firebase.js file
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

export const authOptions = {
    pages: {
        signIn: "/LoginForm", // Use the LoginForm component as the sign-in page
      },
  providers: [
    GoogleProvider({
      clientId: process.env.GCI,
      clientSecret: process.env.GS,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        try {
            const userCredential = await signInWithEmailAndPassword(fauth, credentials.email, credentials.password);
            const user = userCredential.user;
         
            if (user) {
                if (user.emailVerified) {
                    console.log('Firebase login SUCCESS - User:', user);
                    return { id: user.uid, name: user.displayName || user.email, email: user.email };
                } else {

                    // Send email verification
                    await sendEmailVerification(user)
                    .then(() => {
                        console.log("Email verification was sent!");
                    })

                    console.error('Email not yet verified, please check your email to verify you account!', user);
                    throw new Error('Email not verified');
                }
            } else {
                console.error('Firebase login ERROR - User not found:', user);
                throw new Error('User not found');
            }
        } catch (error) {
            if (error.message === 'Firebase: Error (auth/invalid-email).') {
                console.error('Invalid email');
                throw new Error('Invalid email');
            }
            if (error.message === 'Firebase: Error (auth/invalid-credential).') {
                 console.error('Bad username or password');
                 throw new Error('Bad username or password');
            } else {
                console.error("Exact error message is '" + error.message + "'");
                throw new Error(error.message);
            }
        }
      }
    })
  ],
  debug: true,
  secret: process.env.NEXT_AUTH_S,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === 'google') {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.user = { id: user.id, email: user.email, name: user.name };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      return session;
    }
  },
};

export default NextAuth(authOptions);

/*
import axios from 'axios';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials'; // Correct import for credentials
import firebase from '../../../utils/firebase'; // Ensure this path is correct for your Firebase setup

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GCI,
      clientSecret: process.env.GS,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter your email" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" }
      },
      authorize: async (credentials) => {
        try {
          const userCredential = await firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password);
          const user = userCredential.user;
          if (user) {
            // Return the user object for NextAuth to use
            return { id: user.uid, name: user.displayName || user.email, email: user.email };
          } else {
            return null;  // Return null if user data is not found
          }
        } catch (error) {
          throw new Error(error.message);
        }
      }
    }),
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

*/