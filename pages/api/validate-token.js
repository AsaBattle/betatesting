// pages/api/validate-token.js
import { getSession } from "next-auth/react";

export default async (req, res) => {
  const token = req.body.token;

  console.log("/api/auth/validate-token called with Token:", token);

  // Using Next-Auth's getSession to validate session/token
  const session = await getSession({ req: { ...req, headers: { ...req.headers, cookie: `next-auth.session-token=${token}` } } });

  if (session) {
    // Assuming session object contains user data you want to expose
    res.status(200).json({ user: session.user });
  } else {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
