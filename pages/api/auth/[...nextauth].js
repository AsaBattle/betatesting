import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
export const authOptions = {
 providers: [
  GoogleProvider({
   clientId: process.env.GCI,
   clientSecret: process.env.GS,
  }),
 ],
 debug: true,
 secret: process.env.NEXT_AUTH_S,
 session: {
  strategy: 'jwt',
 },
};
export default NextAuth(authOptions);


