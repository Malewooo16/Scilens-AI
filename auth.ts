
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
        const typedCredentials = credentials as Record<string, any>;

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

        if (!existingUser.emailVerified) {
          throw new Error("Email not verified. Please check your inbox for a verification link.");
        }

        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
        };
      },
    }),
    Credentials({
      id: "token-login",
      name: "Token Login",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const typedCredentials = credentials as Record<string, any>;
        const token = typedCredentials.token;

        if (!token) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            verificationToken: token,
          },
        });

        if (user && user.emailVerified) {
          // Clear the token after successful login
          await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: null },
          });
          return user; // Return user if verified
        }
        return null; // Not verified or user not found
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow token-login provider to sign in directly
      if (account?.provider === "token-login") {
        return true;
      }
      // Existing credentials provider logic
      if (account?.provider !== "credentials") return true;
      const existingUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (!existingUser) return false;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
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