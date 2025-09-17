import ResearchForm from "@/components/Research/ResearchForm";

export default function HomePage() {
  return (
   <div className="flex items-center justify-center h-full py-4 sm:py-8">
     <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md md:max-w-md lg:max-w-lg">
      <h1 className="text-2xl font-bold mb-4 text-teal-900">AI Research Search</h1>
      <ResearchForm />
    </div> 
   </div>
  );
}