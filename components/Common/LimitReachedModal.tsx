"use client";

import { useRouter } from "next/navigation";

interface LimitReachedModalProps {
  message: string;
  onClose: () => void;
}

export default function LimitReachedModal({ message, onClose }: LimitReachedModalProps) {
  const router = useRouter();

  const handleUpgradeClick = () => {
    router.push("/pricing"); // Redirect to the pricing page
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm mx-auto">
        <h2 className="text-2xl font-bold text-teal-900 mb-4">Limit Reached</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Close
          </button>
          <button
            onClick={handleUpgradeClick}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}
