'use client';

import { SignUp, SignIn } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function AuthPage() {
  const pathname = usePathname();

  // Render SignUp for /auth/sign-up, SignIn for /auth/sign-in
  if (pathname?.includes('sign-up')) {
    return <SignUp />;
  }
  return <SignIn />;
}
