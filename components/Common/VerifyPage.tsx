"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEmail } from '@/actions/auth';
import { signIn } from 'next-auth/react';


export default function VerifyPage({ token}: { token: string  }) {
  
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const result = await verifyEmail(token);

        if (result.success) {
          // Attempt to auto-login after successful verification
          await signIn('token-login', { token, redirect: false });
          setStatus('success');
          setMessage(result.success);
          router.push('/new'); // Redirect to a protected page
        } else {
          setStatus('error');
          setMessage(result.error || 'An unexpected error occurred during verification.');
        }
      } catch (error) {
        console.error('Verification process error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    handleVerification();
  }, [token, router]);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {status === 'verifying' && 'Verifying your email...'}
          {status === 'success' && 'Email Verified Successfully!'}
          {status === 'error' && 'Email Verification Failed'}
        </h2>
        <p className="mt-4 text-center text-sm text-gray-600">
          {message}
        </p>
        {status === 'error' && (
          <p className="mt-4 text-center text-sm text-gray-600">
            Please try again or contact support.
          </p>
        )}
      </div>
    </div>
  );
}