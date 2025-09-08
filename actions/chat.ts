"use server";
import { searchDocs } from "./vector";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite", // or "gemini-1.5-flash"
});

export async function chatBot(query: string) {
  // 1. Get relevant documents
  const results = await searchDocs(query);

  // 2. Build the context from retrieved results
 // Deduplicate results by sourceUrl
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

  // 3. Create a prompt template
const template = `
You are a helpful assistant. Use the following sources to answer the user’s question.

Guidelines:
- Present results in a clear, human-readable way:
  • Express accuracy, precision, recall, or similar metrics as percentages.  
  • Express counts as whole numbers.  
  • Keep numerical values consistent and easy to compare.  
- If multiple pieces of information come from the same document, cite that source only once.  
- Always cite sources in your answer like (Source 1), (Source 2), etc.
- Keep explanations concise and relevant to the user’s question.

Question: {question}

Sources:
{context}
`;


  const prompt = new PromptTemplate({
    template,
    inputVariables: ["question", "context"],
  });

  // 4. Fill the template with inputs
  const formattedPrompt = await prompt.format({
    question: query,
    context,
  });

  // 5. Ask Gemini for a response
  const response = await llm.invoke(formattedPrompt);

  return {
    answer: response.content,
    sources: results.map((r: any) => ({
      textSnippet: r.textSnippet,
      metadata: r.metadata || { title: r.docTitle, sourceUrl: r.sourceUrl },
      sourceUrl: r.sourceUrl,
      distance: r.distance,
    })),
  };
}
 