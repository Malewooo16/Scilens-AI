'use client';

import { useState } from "react";

const DebugButton = ({ data }: { data: any }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)} className="bg-gray-600 text-white px-4 py-2 rounded-md">
        Debug
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-3xl shadow-2xl transform transition-all duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-3">
              Debug Info
            </h3>
            <pre className="text-slate-600 mb-6 overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium shadow-sm hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugButton;
