"use server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

interface PaperContent {
  sourceUrl: string;
  content: string;
}

/**
 * Generates a structured summary table from multiple research papers.
 */
export async function generateTable(papers: PaperContent[]): Promise<string> {
  const context = papers
    .map(
      (p, i) =>
        `Source ${i + 1} (URL: ${p.sourceUrl}):\n${p.content}\n`
    )
    .join("\n\n---\n\n");

  const prompt = `
You are a research assistant. 
Analyze the sources below and create a **structured summary table** that best represents the key findings.  

## Guidelines:
- Use **no more than 5 simple column headers**.
- Include as many relevant rows as possible.
- Quantitative information is highly appreciated, and should be represented in a consistent format (e.g., percentages, whole numbers).
- If some information is missing, leave the cell blank (do not guess).
- Return the table in a **plain text format** where each row is separated by a newline and columns by a pipe (|). 
  Example:
  Header1 | Header2 | Header3
  Row1Col1 | Row1Col2 | Row1Col3
  Row2Col1 | Row2Col2 | Row2Col3

## Research Papers:
${context}

## Table:
  `;

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text?.trim() ?? "";
}
