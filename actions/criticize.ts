"use server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

interface PaperContent {
  sourceUrl: string;
  content: string;
}

/**
 * Criticizes multiple research papers, then consolidates the criticisms into one list.
 */
export async function criticizePapers(papers: PaperContent[]): Promise<string> {
  // Step 1: Generate individual criticisms for each paper
  const individualCriticisms = await Promise.all(
    papers.map(async (paper, idx) => {
      const prompt = `
You are a critical research analyst. Your task is to identify the **gaps and limitations** in the following research paper.

## Guidelines:
- Focus on methodological weaknesses, unanswered questions, and areas for future research.
- Be specific and provide evidence from the text to support your claims.
- Structure your analysis as a **list of bullet points**.

## Research Paper ${idx + 1} (URL: ${paper.sourceUrl}):
${paper.content}

## Gaps and Limitations:
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
      });

      return response.text?.trim() ?? "";
    })
  );

  const combinedCriticism = individualCriticisms.join("\n\n---\n\n");

  // Step 2: Consolidate into one merged list
  const finalPrompt = `
You are a critical research analyst. Your task is to **synthesize** the following criticisms into a single, consolidated list of gaps and limitations.

## Guidelines:
- Combine similar points from different papers.
- Remove duplicate points.
- Structure your analysis as a **list of bullet points**.

## Criticisms:
${combinedCriticism}

## Consolidated Gaps and Limitations:
  `;

  const finalResponse = await genAI.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: finalPrompt,
  });

  return finalResponse.text?.trim() ?? "";
}
