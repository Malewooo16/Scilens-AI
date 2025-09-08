import { table } from "@/actions/table";

type Reference = {
  sourceUrl: string;
  metadata?: {
    title?: string;
  };
};

export type TableData = {
  table: string;
  sources?: Reference[];
};

type Props = {
  researchQuery: string;
};

export default async function ResearchTable({ researchQuery }: Props) {
  const data = await table(researchQuery);

  if (!data?.table) {
    return <p className="text-teal-700">No results found for &quot;{researchQuery}&quot;.</p>;
  }

  // Ensure table is a string before splitting
  const tableString =
    typeof data.table === "string"
      ? data.table
      : Array.isArray(data.table)
      ? data.table.map((item: any) => (typeof item === "string" ? item : "")).join("\n")
      : "";

  // Parse Gemini response into rows and columns
  const rows = tableString
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length > 1); // ignore any empty lines

  const headers = rows.shift() || [];

  const uniqueTableSources = (sources?: Reference[]) => {
  if (!sources) return [];
  const map = new Map<string, Reference>();
  sources.forEach((s) => {
    if (s.sourceUrl && !map.has(s.sourceUrl)) map.set(s.sourceUrl, s);
  });
  return Array.from(map.values());
};

  return (
    <div className="w-full mx-auto p-4 space-y-4">
    
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
     {data.sources && data.sources?.length > 0 && (
  <div>
    <h3 className="text-lg font-medium text-teal-800">Sources</h3>
    <ul className="list-disc ml-6 text-sm text-teal-700">
      {uniqueTableSources(data.sources).map((s, i) => (
        <li key={i}>
          <a
            href={s.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-teal-900"
          >
            {s.metadata?.title || s.sourceUrl}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}

    </div>
  );
}
