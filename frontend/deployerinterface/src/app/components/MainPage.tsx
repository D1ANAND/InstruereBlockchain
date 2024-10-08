import Link from 'next/link'
import React from 'react'
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignOutButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Bubbles from './Bubble';
const MainPage = () => {
  return (
    <div>
 {/* <ClerkProvider>
      <div className="absolute top-4 flex justify-between right-64 space-x-6">
  <SignedOut>
    <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-2 border hover:from-blue-700 hover:to-teal-600 duration-500 rounded-md">
      <SignInButton />
    </div>
    <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-2 border rounded-md">
      <SignUpButton />
    </div>
  </SignedOut>

  <SignedIn>
    <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-2 border rounded-md">
      <UserButton />
    </div>
  </SignedIn>
</div>
</ClerkProvider> */}
<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  pl-4 pr-4 pt-2 pb-2 rounded-lg shadow-lg hover:bg-blue-400 duration-500 bg-[#4FD1c5]">

  <Link href="/upload">
    <button className="text-5xl">Launch App</button>
  </Link>
</div>
    </div>


  )
}

export default MainPage