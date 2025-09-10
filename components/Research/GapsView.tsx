import { prisma } from "@/db/prisma";
import React from "react";


interface CriticismFormatterProps {
  text: string;
}

 const CriticismFormatter: React.FC<CriticismFormatterProps> = ({ text }) => {
  // Split into lines
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  // Filter bullet points
  const bullets = lines
    .filter((line) => line.startsWith("* "))
    .map((line) => line.slice(2).trim()); // remove only leading "* "

  return (
    <ul className="list-disc list-inside space-y-2">
      {bullets.map((bullet, idx) => (
        <li key={idx} className="text-gray-800">
          {bullet.split(/\*\*(.*?)\*\*/g).map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          )}
        </li>
      ))}
    </ul>
  );
};


const GapsView = async ({researchQueryId}: {researchQueryId: string}) => {
  const researchQuery = await prisma.researchQuery.findUnique({
    where: {id: researchQueryId},
  });

  if (!researchQuery?.gaps) {
    return <div>No gaps and limitations analysis available.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-teal-800">
          Gaps and Limitations
        </h2>
      </div>
      <div className="prose prose-lg max-w-none">
        {researchQuery.gaps.split('\n').map((line, index) => (
          <div key={index}> <CriticismFormatter text={line} /></div>
        ))}
      </div>
    </div>
  );
};

export default GapsView;
