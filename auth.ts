
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";




export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({}),
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "text" },
      },
      async authorize(credentials) {
        // The `credentials` object needs to be explicitly typed to ensure `email` and `password` exist.
        const typedCredentials = credentials as Record<string, string | undefined>;
        const email = typedCredentials.email;
        const password = typedCredentials.password;

        if (!email || !password) {
          return null;
        }

        const existingUser = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        if (!existingUser || !existingUser.password) {
          throw new Error("Invalid credentials");
        }

        const passwordMatch = password === existingUser.password;
        if (!passwordMatch) {
          throw new Error("Invalid credentials");
        }

        // Return a user object with the required properties.
        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;
      const existingUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      // It's good practice to handle cases where the user might not be found.
      if (!existingUser) return false;

      // You can implement email verification checks here if needed.
      // e.g., if (!existingUser.emailVerified) return false;

      return true;
    },
    async jwt({ token, user }) {
      // The `user` object is only present on the first sign-in, so we check if it exists.
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure the `session.user` and `token` are properly handled.
      if (session.user && token.id) {
        // Here, we cast the token.id to a string to ensure consistency.
        session.user.id = String(token.id);
      }
      return session;
    },
  },
  pages: {
    signOut: "/",
  },
  session: {
    strategy: "jwt",
  },
});