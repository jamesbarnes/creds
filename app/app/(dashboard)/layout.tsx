import { ReactNode, Suspense } from "react";
import Profile from "@/components/profile";
import Nav from "@/components/nav";
import { ClerkProvider, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'


          



export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
<SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
    <div>
      <Nav>
        <Suspense fallback={<div>Loading...</div>}>
          <Profile />
        </Suspense>
      </Nav>
      <div className="min-h-screen dark:bg-black sm:pl-60">{children}</div>
    </div>
    </SignedIn>
         </>
  );
}
