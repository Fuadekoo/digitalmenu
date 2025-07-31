import NextAuth, { CredentialsSignin, NextAuthConfig } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import prisma from "./db";
import { loginSchema } from "./zodSchema";
// import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id?: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
  }
}

export class CustomError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/en/signin",
    signOut: "/signout",
  },
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      if (auth) {
        if (nextUrl.pathname.startsWith("/en/signin")) {
          return Response.redirect(new URL("/en/dashboard", nextUrl));
        } else return true;
      } else if (nextUrl.pathname.startsWith("/en/dashboard")) {
        return false;
      } else return true;
    },

    jwt: async ({ token, user }) => {
      return { ...token, ...user };
    },
    session: async ({ session, token }) => {
      return { ...session, user: { ...session.user, ...token } };
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { phone, password } = await loginSchema.parseAsync(credentials);
        const user = await prisma.user.findFirst({
          where: { phone },
          select: { id: true, role: true, password: true },
        });
        if (!user) throw new CustomError("Invalid Phone Number");
        if (!user.password) throw new CustomError("Password Not Set");
        if (!(await bcryptjs.compare(password, user.password)))
          throw new CustomError("Invalid Password");
        return { id: user.id, role: user.role };
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
