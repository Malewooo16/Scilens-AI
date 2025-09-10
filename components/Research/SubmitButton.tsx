"use client";

import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import LoadingMessages from "./LoadingMessages";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-medium rounded-md shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      whileTap={{ scale: 0.95 }}
    >
      {pending ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <LoadingMessages />
        </div>
      ) : (
        "Search Papers"
      )}
    </motion.button>
  );
}
