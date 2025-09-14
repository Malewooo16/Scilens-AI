import React, { JSX } from "react";

interface FormattedSummaryProps {
  text: string;
}

const FormattedSummary: React.FC<FormattedSummaryProps> = ({ text }) => {
  const lines = text.split("\n").filter(Boolean);

  // Helper to format bold text
  const formatBold = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Build list with support for sub-bullets
  const renderList = () => {
    const mainList: JSX.Element[] = [];
    let subList: JSX.Element[] = [];
    let currentMain: JSX.Element | null = null;

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("*")) {
        // Sub-bullet
        const content = trimmed.replace(/^\*\s*/, "");
        subList.push(<li key={idx}>{formatBold(content)}</li>);
      } else {
        // Save previous main with subList if exists
        if (currentMain) {
          mainList.push(
            <li key={idx}>
              {currentMain}
              {subList.length > 0 && <ul>{subList}</ul>}
            </li>
          );
          subList = [];
        }
        currentMain = <>{formatBold(trimmed)}</>;
      }
    });

    // Push the last main point
    if (currentMain) {
      mainList.push(
        <li key={lines.length}>
          {currentMain}
          {subList.length > 0 && <ul>{subList}</ul>}
        </li>
      );
    }

    return <ol>{mainList}</ol>;
  };

  return <>{renderList()}</>;
};

export default FormattedSummary;
