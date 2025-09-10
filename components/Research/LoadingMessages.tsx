"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const messages = [
  "Compiling relevant research papers…",
  "Extracting key findings from studies…",
  "Analyzing citations and references…",
  "Summarizing results into a structured report…",
  "Almost there, polishing up your research insights…",
];

export default function LoadingMessages() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span
      key={messageIndex}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.5 }}
    >
      {messages[messageIndex]}
    </motion.span>
  );
}
