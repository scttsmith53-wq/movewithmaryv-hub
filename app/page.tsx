'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeUserFromUrl, getPortalUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    initializeUserFromUrl();
    const user = getPortalUser();
    router.replace(user?.email ? '/dashboard' : '/login');
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-brand-grid p-6 text-white">
      <div className="text-center">
        <p className="kicker justify-center">Move With Mary V</p>
        <h1 className="mt-4 text-4xl font-black">Opening your member portal...</h1>
      </div>
    </main>
  );
}
