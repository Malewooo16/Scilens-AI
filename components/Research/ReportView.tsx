import React from "react";
import { searchDocs, generateReport } from "@/actions/vector";
import { prisma } from "@/db/prisma";
import Link from "next/link";

type Reference = {
  id: number;
  url: string;
  title?: string;
};

interface ReportFormatterProps {
  report: string;
  references: Reference[];
}

function ReportFormatter({report, references}: ReportFormatterProps) {

  function renderInlineWithCitations(text: string, keyPrefix = "") {
    const tokens = text.split(/(\[\d+\])/g);
    return tokens.map((token, idx) => {
      const m = token.match(/^\D*(\d+)\D*$/);
      if (m) {
        const id = Number(m[1]);
        const ref = references.find((r) => r.id === id);
        if (ref && ref.url) {
          return (
            <Link
              key={`${keyPrefix}-ref-${idx}`}
              href={ref.url}
              target="_blank"
              className="text-blue-600 underline"
            >
              [{id}]
            </Link>
          );
        } else {
          return (
            <span key={`${keyPrefix}-ref-${idx}`} className="text-gray-600">
              [{id}]
            </span>
          );
        }
      }
      return <React.Fragment key={`${keyPrefix}-txt-${idx}`}>{token}</React.Fragment>;
    });
  }

  function renderBoldAndInline(text: string, keyPrefix = "") {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, k) =>
      k % 2 === 1 ? (
        <strong key={`${keyPrefix}-b-${k}`} className="font-semibold text-gray-800">
          {renderInlineWithCitations(part, `${keyPrefix}-b-${k}`)}
        </strong>
      ) : (
        <React.Fragment key={`${keyPrefix}-n-${k}`}>{renderInlineWithCitations(part, `${keyPrefix}-n-${k}`)}</React.Fragment>
      )
    );
  }

  function formatReportText(reportText: string) {
    const lines = reportText.split("\n");
    const elements: React.ReactNode[] = [];
    let listBuffer: string[] = [];

    const flushListBuffer = (idxKey: string) => {
      if (listBuffer.length === 0) return;
      elements.push(
        <ul key={`ul-${idxKey}`} className="list-disc list-inside mb-4">
          {listBuffer.map((item, j) => (
            <li key={`li-${idxKey}-${j}`} className="mb-1 leading-relaxed">
              {renderBoldAndInline(item, `li-${idxKey}-${j}`)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    };

    lines.forEach((rawLine, i) => {
      const line = rawLine.trim();
      if (!line) {
        flushListBuffer(String(i));
        return;
      }
      if (line.startsWith("#### ")) {
        flushListBuffer(String(i));
        elements.push(
          <h4 key={`h4-${i}`} className="text-lg font-semibold mb-2">
            {renderBoldAndInline(line.slice(5), `h4-${i}`)}
          </h4>
        );
      } else if (line.startsWith("### ")) {
        flushListBuffer(String(i));
        elements.push(
          <h3 key={`h3-${i}`} className="text-xl font-semibold mb-3">
            {renderBoldAndInline(line.slice(4), `h3-${i}`)}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        flushListBuffer(String(i));
        elements.push(
          <h2 key={`h2-${i}`} className="text-2xl font-bold mb-4">
            {renderBoldAndInline(line.slice(3), `h2-${i}`)}
          </h2>
        );
      } else if (line.startsWith("* ")) {
        listBuffer.push(line.slice(2));
      } else {
        flushListBuffer(String(i));
        elements.push(
          <p key={`p-${i}`} className="mb-4 leading-relaxed">
            {renderBoldAndInline(line, `p-${i}`)}
          </p>
        );
      }
    });

    flushListBuffer("end");
    return elements;
  }

  return (
    <div className="prose max-w-none">
      <div>{formatReportText(report)}</div>
      {references && references.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">References</h3>
          <ol className="list-decimal list-inside space-y-1">
            {references.map((ref) => (
              <li key={`ref-${ref.id}`} className="text-sm">
                <Link href={ref.url} target="_blank" className="text-blue-600 hover:underline">
                  {ref.title ? ref.title : ref.url}
                </Link>{" "}
                <span className="text-gray-500"> {ref.title ? `(${ref.url})` : ""}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

const ReportView = async ({researchQueryId}: {researchQueryId: string}) => {
  const researchQuery = await prisma.researchQuery.findUnique({
    where: {id: researchQueryId},
    include: {documents: {include: {embeddings: true}}},
  });
  const results = await searchDocs(researchQuery?.enhancedQuery as string);
  const report = await generateReport(
    researchQuery?.enhancedQuery as string,
    results
  );

  if (!report) {
    return <div>No report available.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-teal-800 mb-4">
        Generated Report
      </h2>
      <div className="prose prose-lg max-w-none">
        <ReportFormatter report={report.report} references={report.references} />
      </div>
    </div>
  );
};

export default ReportView;