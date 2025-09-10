"use server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

interface PaperContent {
  sourceUrl: string;
  content: string;
}

/**
 * Summarizes multiple research papers and synthesizes them into a structured report.
 */
export async function summarizePapers(papers: PaperContent[]): Promise<string> {
  const model = "gemini-2.5-flash";

  // Step 1: Summarize each paper individually
  const individualSummaries = await Promise.all(
    papers.map(async (paper, idx) => {
      const prompt = `
You are a research assistant. Summarize the following research paper.

## Guidelines:
- Provide a concise summary of the paper's key findings.
- Focus on the main points and conclusions.

## Source ${idx + 1}:
${paper.sourceUrl}

## Paper:
${paper.content}

## Summary:
      `;

      const resp = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      return `Source ${idx + 1} (${paper.sourceUrl}):\n${resp.text ?? ""}`;
    })
  );

  // Step 2: Combine into a structured synthesis
  const combinedSummary = individualSummaries.join("\n\n---\n\n");

  const finalPrompt = `
You are a research assistant. Synthesize the following summaries into a single, structured report.

## Requirements:
1. The report must include these sections: 
   - ## Introduction 
   - ## Methodology 
   - ## Results 
   - ## Conclusion 
   - ## References
2. Synthesize information across all summaries (do not just list them).
3. Use inline citations like (Source 1), (Source 2), etc., based on the provided summaries.
4. In the References section, include the source URL with a descriptive title.

## Summaries:
${combinedSummary}

## Report:
  `;

  const finalResp = await genAI.models.generateContent({
    model,
    contents: finalPrompt,
  });

  return (finalResp.text ?? "").trim();
}
