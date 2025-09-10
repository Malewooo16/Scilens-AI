'use client';

import { exportPdf } from "@/actions/exportPdf";

const DownloadButton = ({ researchQueryId }: { researchQueryId: string }) => {

const handleDownload = async () => {
  const pdfBytes = await exportPdf(researchQueryId);

  // ✅ use .buffer to satisfy BlobPart
  //@ts-ignore
  const blob = new Blob([pdfBytes.buffer], { type: "application/pdf" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `research-report-${researchQueryId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


  return (
    <button onClick={handleDownload} className="bg-teal-600 text-white px-4 py-2 rounded-md">
      Export as PDF
    </button>
  );
};

export default DownloadButton;
