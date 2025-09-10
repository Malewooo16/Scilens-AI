'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingView({ researchId }: { researchId: string }) {
  const [status, setStatus] = useState('PENDING');
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/research/${researchId}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setProgress(data.progress);

          if (data.status === 'COMPLETE' || data.status === 'FAILED') {
            clearInterval(interval);
            router.refresh();
          }
        }
      } catch (error) {
        console.error('Failed to fetch status', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [researchId, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-semibold text-teal-800 mb-4">
        Processing Research...
      </h2>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-teal-600 h-4 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between w-full text-sm text-gray-600">
        <span>{progress}%</span>
        <span>Time Elapsed: {formatTime(elapsedTime)}</span>
      </div>
      <p className="mt-4 text-gray-600">Status: {status}</p>
    </div>
  );
}
