import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";


const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          gh_username: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: "/login", // Error code passed in query string as ?error=
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
        domain: VERCEL_DEPLOYMENT
          ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
          : undefined,
        secure: VERCEL_DEPLOYMENT,
      },
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        // @ts-expect-error
        id: token.sub,
        // @ts-expect-error
        username: token?.user?.username || token?.user?.gh_username,
      };
      return session;
    },
  },
};

// export function getSession() {
//   return getServerSession(authOptions) as Promise<{
//     user: {
//       id: string;
//       name: string;
//       username: string;
//       email: string;
//       image: string;
//     };
//   } | null>;
// }

// New Clerk code
export async function getSession(): Promise<any> {
  // console.log('auth()');
  // console.log(auth());
  const user = await currentUser();
  // console.log('user');
  // console.log(user);
  // console.log(user?.primaryEmailAddress);
  // console.log(user?.primaryEmailAddress.emailAddress);

  const newUser = {
    user: {
    id: user?.id,
    name: `${user?.firstName} ${user?.lastName}`,
    username: user?.username,
    email: user?.primaryEmailAddress.emailAddress,
    image: user?.imageUrl,
    },
  };

  console.log('newUser');
  console.log(newUser);

  const prismaUser = await prisma.user.findUnique({
    where: {
      id: newUser.user.id,
    },
  });
  if (!prismaUser) {
    await prisma.user.create({
      data: {
        id: newUser.user.id,
        name: newUser.user.name,
        username: newUser.user.username,
        email: newUser.user.email,
        image: newUser.user.image,
      },
    });
  }


  console.log('getServerSession(authOptions)');
  // const sessionStuff = await getServerSession(authOptions);
  console.log(await getServerSession(authOptions));

  return newUser;

  // return newUser;
}

export function withSiteAuth(action: any) {
  return async (
    formData: FormData | null,
    siteId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session) {
      return {
        error: "Not authenticated",
      };
    }
    const site = await prisma.site.findUnique({
      where: {
        id: siteId,
      },
    });
    if (!site || site.userId !== session.user.id) {
      return {
        error: "Not authorized",
      };
    }

    return action(formData, site, key);
  };
}

export function withPostAuth(action: any) {
  return async (
    formData: FormData | null,
    postId: string,
    key: string | null,
  ) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        site: true,
      },
    });
    if (!post || post.userId !== session.user.id) {
      return {
        error: "Post not found",
      };
    }

    return action(formData, post, key);
  };
}
