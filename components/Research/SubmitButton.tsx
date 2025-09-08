"use client";
import React from "react";
import {useFormStatus} from "react-dom";

export default function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
    disabled={pending}
      className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 transition-colors duration-200"
    >
      {pending ? "Searching..." : "Search"}
    </button>
  );
}
