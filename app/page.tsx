'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { signout } from './login/actions';

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      // Fetch profile from profile table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        console.log("User" , data)

      if (error) {
        console.error('Error fetching profile:', error.message);
        return;
      }

      setProfile(data);
    }

    fetchProfile();
  }, [router, supabase]);

  const handleLogout = async () => {
    await signout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-between px-8 py-16 sm:px-20 font-sans bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Image src="/next.svg" alt="Next.js Logo" width={120} height={30} />
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </header>

      <main className="flex flex-col items-center text-center max-w-2xl gap-6">
        <h1 className="text-4xl font-bold">Welcome to Your Next.js App</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          You're authenticated via Supabase.
        </p>

        {profile ? (
          <div className="mt-4">
            <h2 className="text-2xl font-semibold">Hello, {profile.full_name || profile.username || 'User'}!</h2>
            {/* Customize according to your profile fields */}
            <p>Email: {profile.email || 'Not available'}</p>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded transition"
          >
            📘 Read Docs
          </a>
          <a
            href="https://vercel.com/templates?framework=next.js"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm px-5 py-3 rounded transition"
          >
            🧩 Browse Templates
          </a>
        </div>
      </main>

      <footer className="text-sm text-gray-500 mt-16">
        Built with ❤️ using Next.js and Supabase
      </footer>
    </div>
  );
}
