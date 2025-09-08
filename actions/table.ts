"use server"
import { searchDocs } from "./vector";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", // or "gemini-1.5-flash"
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function table(researchQuery: string) {
//  console.log("Generating table for query:", researchQuery);
  // 1. Retrieve relevant docs
  const results = await searchDocs(researchQuery);
const uniqueResultsMap = results.reduce((acc: Record<string, any>, r: any) => {
  if (r.sourceUrl && !acc[r.sourceUrl]) {
    acc[r.sourceUrl] = r;
  }
  return acc;
}, {});

const uniqueResults = Object.values(uniqueResultsMap);

// Build context using only unique sources
const context = uniqueResults
  .map(
    (r: any, i: number) =>
      `Source ${i + 1}:\n${r.textSnippet}\nSource URL: ${r.sourceUrl}\n`
  )
  .join("\n\n");

  // 3. General table extraction prompt
const template = `
You are a research assistant. 
Analyze the sources below and create a **structured summary table** that best represents the key findings.  

Guidelines:
- Use **no more than 5 simple column headers**.
- Include as many relevant rows as possible.
-Quanitative information will be highly appreciated, and should be represented in a consistent format (e.g., percentages, whole numbers).
- If some information is missing, leave the cell blank (do not guess).
- Return the table in a **plain text format** where each row is separated by a newline and columns by a special delimiter (e.g., tab \t or pipe |) so it can be parsed into a JSX table.

Research Query: {query}

Sources:
{context}
`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ["query", "context"],
  });

  const formattedPrompt = await prompt.format({
    query: researchQuery,
    context,
  });

  // 4. Call Gemini
  const response = await llm.invoke(formattedPrompt);

  return {
    table: response.content, // markdown table
    sources: results.map((r: any) => ({
      textSnippet: r.textSnippet,
      metadata: r.metadata || { title: r.docTitle, sourceUrl: r.sourceUrl },
      sourceUrl: r.sourceUrl,
      distance: r.distance,
    })),
  };
}
