import { searchDocuments } from "@/actions";
import SubmitButton from "@/components/Research/SubmitButton";


export default function HomePage() {
  return (
   <div className="flex items-center justify-center h-full">
     <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-teal-900">AI Research Search</h1>
      <form action={searchDocuments} className="space-y-4">
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
          />
        </div>
        <SubmitButton />
      </form>
    </div> 
   </div>
  );
}