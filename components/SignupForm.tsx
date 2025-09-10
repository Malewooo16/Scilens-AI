"use client";

import { signup } from '@/actions/auth';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.success);
        // Optionally redirect after a short delay or show a success message
        // router.push('/login'); 
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-teal-300 to-emerald-200 p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 max-w-md w-full">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Create an Account
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Join{" "}
          <span className="font-semibold text-teal-700">SciLensAI</span> to
          explore research smarter
        </p>

        {/* Google Login */}
        <button
          onClick={()=> signIn("google", { callbackUrl: "/new" })}
          className="w-full flex items-center justify-center gap-3 py-3 mb-4 text-lg font-medium bg-white text-gray-700 border border-gray-300 rounded-xl shadow hover:bg-gray-100 transition"
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center mb-4">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 text-white font-semibold bg-teal-600 rounded-xl shadow hover:bg-teal-700 transition disabled:opacity-70"
          >
            {isPending ? "Creating account…" : "Sign up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-teal-700 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

