import { prisma } from "@/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import Chat from "@/components/Research/Chat";
import ResearchTable from "@/components/Research/ResearchTable";
import ReportView from "@/components/Research/ReportView";
import KnowledgeGraph from "@/components/Research/KnowledgeGraph";
import Visualizations from "@/components/Research/Visualizations";

const Tabs = ({ view, id }: { view: string; id: string }) => {
  const activeView = view || "report";

  const tabs = [
    { key: "report", label: "Report" },
    { key: "tables", label: "Tables" },
    { key: "chat", label: "Chat" },
    { key: "graph", label: "Knowledge Graph" },
    { key: "visualizations", label: "Visualizations" },
  ];

  return (
    <div className="mb-6 border-b border-gray-200">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = activeView === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/results/${id}?view=${tab.key}`}
              className={`relative py-2 font-semibold transition-colors ${
                isActive
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default async function ResearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { view } = await searchParams;

  if (!id) return redirect("/error");

  const researchQuery = await prisma.researchQuery.findUnique({
    where: { id: id },
    include: { documents: true },
  });

  if (!researchQuery) return redirect("/new");

  const activeView = view || "report";

  return (
    <div className="p-6 w-full mx-auto">
     {activeView === "chat" && ( <h1 className="text-3xl font-bold text-center text-teal-900 mb-8">
        Research Report
      </h1>)}

      {/* Enhanced Query */}
    {activeView === "chat" && (  <div className="bg-white/70 shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-teal-700 mb-2">
          Research Topic
        </h2>
        <p className="text-gray-700">{researchQuery?.enhancedQuery}</p>
      </div>)}

      {/* Tabs */}
      <Tabs view={activeView as string} id={id} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeView === "report" && <ReportView researchQueryId={id} />}
        {activeView === "tables" && (
          <ResearchTable researchQuery={researchQuery?.enhancedQuery as string} />
        )}
        {activeView === "chat" && <Chat />}
        {activeView === "graph" && <KnowledgeGraph researchQueryId={id} initialGraphData={researchQuery?.knowledgeGraph} />}
        {activeView === "visualizations" && <Visualizations researchQueryId={id} initialVisualizations={researchQuery?.visualizations} researchQuery={researchQuery?.enhancedQuery as string} />}
      </div>
    </div>
  );
}
