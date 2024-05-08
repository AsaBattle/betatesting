import axios from 'axios';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { fauth } from '../../../utils/firebase';

export default async function auth(req, res) {
  const providers = [
    GoogleProvider({
      clientId: process.env.GCI,
      clientSecret: process.env.GS,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      callbackUrl: "/api/auth/callback/google",
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter your email" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" },
      },
      authorize: async (credentials) => {
        try {
          const userCredential = await fauth.signInWithEmailAndPassword(credentials.email, credentials.password);
          const user = userCredential.user;
          if (user) {
            return { id: user.uid, name: user.displayName || user.email, email: user.email };
          } else {
            return null;
          }
        } catch (error) {
          throw new Error(error.message);
        }
      },
    }),
  ];

  return await NextAuth(req, res, {
    providers,
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
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
      },
    },
  });
}

// Returns the user from the database based on the user's next auth id
async function findUserByNextAuthID(nextAuthID) {
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