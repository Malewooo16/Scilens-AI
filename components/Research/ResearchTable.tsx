import { prisma } from "@/db/prisma";

type Reference = {
  sourceUrl: string;
  title?: string;
};

export type TableData = {
  table: string;
  sources?: Reference[];
};

type Props = {
  researchQueryId: string;
};

export default async function ResearchTable({ researchQueryId }: Props) {
  const researchQuery = await prisma.researchQuery.findUnique({
    where: { id: researchQueryId },
    include: { documents: true },
  });

  if (!researchQuery?.table) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-lg font-semibold text-teal-800">Generating Table...</p>
        <p className="text-gray-600">This may take a moment. Please wait.</p>
      </div>
    </div>;
  }

  const tableString = researchQuery.table;

  // Parse Gemini response into rows and columns
  const rows = tableString
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length > 1); // ignore any empty lines

  const headers = rows.shift() || [];

  const sources = researchQuery.documents.map(doc => ({ sourceUrl: doc.sourceUrl || '', metadata: { title: doc.title } }));

  const uniqueTableSources = (sources?: Reference[]) => {
    if (!sources) return [];
    const map = new Map<string, Reference>();
    sources.forEach((s) => {
      if (s.sourceUrl && !map.has(s.sourceUrl)) map.set(s.sourceUrl, s);
    });
    return Array.from(map.values());
  };

  return (
    <div className="w-full mx-auto p-4 space-y-4 md:max-w-3xl lg:max-w-5xl">
    
      <div className="overflow-x-auto border border-teal-200 rounded-lg shadow bg-emerald-50 p-4">
        <table className="min-w-full border-collapse border border-teal-300">
          <thead className="bg-teal-100">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="border border-teal-200 px-4 py-2 text-left text-teal-900 font-medium"
                >
                  {header || ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="even:bg-teal-50">
                {row.map((cell, j) => (
                  <td key={j} className="border border-teal-200 px-4 py-2 text-teal-800">
                    {cell || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sources */}
     {sources && sources?.length > 0 && (
  <div>
    <h3 className="text-lg font-medium text-teal-800">Sources</h3>
    <ul className="list-disc ml-6 text-sm text-teal-700">
      {uniqueTableSources(sources).map((s, i) => (
        <li key={i}>
          <a
            href={s.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-teal-900"
          >
            {s.title || s.sourceUrl}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}

    </div>
  );
}
