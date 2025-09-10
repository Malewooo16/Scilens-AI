import { prisma } from "@/db/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import Chat from "@/components/Research/Chat";
import ResearchTable from "@/components/Research/ResearchTable";
import ReportView from "@/components/Research/ReportView";
import KnowledgeGraph from "@/components/Research/KnowledgeGraph";
import Visualizations from "@/components/Research/Visualizations";
import GapsView from "@/components/Research/GapsView";
import DownloadButton from "@/components/Research/DownloadButton";

const Tabs = ({ view, id }: { view: string; id: string }) => {
  const activeView = view || "report";

  const tabs = [
    { key: "report", label: "Report" },
    { key: "tables", label: "Tables" },
    { key: "chat", label: "Chat" },
    { key: "graph", label: "Knowledge Graph" },
    { key: "visualizations", label: "Visualizations" },
    { key: "gaps", label: "Gaps & Limitations" },
  ];

  return (
    <div className="mb-6 border-b border-gray-200">
      <div className="flex flex-wrap gap-3 sm:gap-6">
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

import { searchDocumentsOnDemand } from "@/actions/index";

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

  let researchQuery = await prisma.researchQuery.findUnique({
    where: { id: id },
    include: { documents: true },
  });

  if (!researchQuery) {return redirect("/new");}

  const activeView = view || "report";

  if (activeView === 'tables' && !researchQuery.table) {
    await searchDocumentsOnDemand(id, 'table');
    researchQuery = await prisma.researchQuery.findUnique({
      where: { id: id },
      include: { documents: true },
    });
  }

  if (activeView === 'gaps' && !researchQuery?.gaps) {
    await searchDocumentsOnDemand(id, 'gaps');
    researchQuery = await prisma.researchQuery.findUnique({
      where: { id: id },
      include: { documents: true },
    });
  }

  return (
    <div className="p-4 sm:p-6 w-full mx-auto md:max-w-3xl lg:max-w-5xl">
      <div className="flex flex-row-reverse justify-between items-center mb-8">
        
        <DownloadButton researchQueryId={researchQuery?.id as string} />
         <h1 className="text-3xl font-bold text-teal-900">
        Research Report for {researchQuery?.enhancedQuery}
      </h1>
      </div>

     

   

      {/* Tabs */}
      <Tabs view={activeView as string} id={id} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeView === "report" && <ReportView researchQueryId={id} />}
        {activeView === "tables" && (
          <ResearchTable researchQueryId={id} />
        )}
        {activeView === "chat" && <Chat />}
        {activeView === "graph" && <KnowledgeGraph researchQueryId={id} initialGraphData={researchQuery?.knowledgeGraph} />}
        {activeView === "visualizations" && <Visualizations researchQueryId={id} initialVisualizations={researchQuery?.visualizations} />}
        {activeView === "gaps" && <GapsView researchQueryId={id} />}
      </div>
    </div>
  );
}
