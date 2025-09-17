"use client";

import { useFormStatus } from "react-dom";
import {useActionState} from "react"
import { searchDocuments } from "@/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LimitReachedModal from "@/components/Common/LimitReachedModal"; // Will create this next

export default function ResearchForm() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await searchDocuments(formData);
      if (result.success && result.redirectPath) {
        router.push(result.redirectPath);
      } else if (result.error) {
        if (result.redirectToPricing) {
          setModalMessage(result.error);
          setShowModal(true);
        } else {
          // Handle other errors, maybe display a toast or a generic error message
          console.error("Error:", result.error);
          alert(result.error); // For now, a simple alert
        }
      }
      return result;
    },
    null
  );

  const { pending } = useFormStatus();

  return (
    <>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700">
            Research Topic
          </label>
          <input
            type="text"
            name="query"
            id="query"
            placeholder="Enter your research topic here"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            disabled={pending || isPending}
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          disabled={pending || isPending}
        >
          {pending || isPending ? "Searching..." : "Start Research"}
        </button>
      </form>

      {showModal && (
        <LimitReachedModal
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
