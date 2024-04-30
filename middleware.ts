import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  auth,
  clerkMiddleware,
  createRouteMatcher,
  redirectToSignIn,
} from '@clerk/nextjs/server';
// import createMiddleware from 'next-intl/middleware';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};


// export const config = {
//   matcher: [
//     '/((?!.*\\..*|_next).*)', // Don't run middleware on static files
//     '/', // Run middleware on index page
//     '/(api|trpc)(.*)'], // Run middleware on API routes
// };


const isProtectedRoute = createRouteMatcher([
  "/app/:path*",
  "/login",
  "/post/:path*",
  "/settings/:path*",
  "/site/:path*",
  
]);

async function intlMiddleware(req: NextRequest) {
  console.log("middleware");
  console.log("url: ", req.nextUrl);
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  console.log("host: ", req.headers.get("host"));
  let hostname = req.headers
    .get("host")!
    .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);
console.log("hostname: ", hostname);
console.log("process.env.NEXT_PUBLIC_ROOT_DOMAIN: ", process.env.NEXT_PUBLIC_ROOT_DOMAIN);
  // special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${
      process.env.NEXT_PUBLIC_ROOT_DOMAIN
    }`;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // rewrites for app pages
  
  if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    // console.log("hostname: ", hostname);
    // console.log("app page");
    // const session = await getToken({ req });
    // const session = await auth();
    // if (!session && path !== "/login") {
    //   return NextResponse.redirect(new URL("/login", req.url));
    // } else if (session && path == "/login") {
    //   return NextResponse.redirect(new URL("/", req.ur`l));
    // }
    return NextResponse.rewrite(
      new URL(`/app${path === "/" ? "" : path}`, req.url),
    );
  }

  // special case for `vercel.pub` domain
  if (hostname === "vercel.pub") {
    return NextResponse.redirect(
      "https://vercel.com/blog/platforms-starter-kit",
    );
  }

  // rewrite root application to `/home` folder
  if (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url),
    );
  }

  // rewrite everything else to `/[domain]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}


export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
 
  return intlMiddleware(req);
});


