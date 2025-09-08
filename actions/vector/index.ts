"use server";
import {prisma} from "@/db/prisma";
import {GoogleGenAI} from "@google/genai";
import { generateEmbedding } from "..";


/**
 * Hybrid Search (Vector + Full Text)
 * @param query Search query from user
 * @param topK  How many results to return
 */

const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY!});

export async function searchDocs(query: string, topK = 5) {
//  console.log("Searching for:", query);
  // 1️⃣ Create query embedding for semantic search
  const embedding = await generateEmbedding(query);
  // 2️⃣ Vector Search
  const results = await prisma.$queryRawUnsafe(`
    SELECT 
        e.id,
        e.chunkText AS textSnippet,
        d.title AS docTitle,
        d.metadata AS metadata,
        d.sourceUrl AS sourceUrl,
        vec_cosine_distance(e.embeddings, '[${embedding.join(
          ","
        )}]') AS distance
    FROM embedding e
    JOIN document d ON e.documentId = d.id
    HAVING distance < 1
    ORDER BY distance
    LIMIT ${topK};
`);

 // console.log("Vector Search Results:", results);
  return (results as any[]).map((r) => ({
    textSnippet: r.textSnippet,
    metadata: r.metadata || {title: r.docTitle, sourceUrl: r.sourceUrl},
    sourceUrl: r.sourceUrl,
    distance: r.distance,
  }));
}

/**
 * Generate a research report from search results
 * @param query The original search query
 * @param searchResults Search results from vector search
 */
export async function generateReport(query: string, searchResults: any[]) {
  // ✅ Deduplicate results by sourceUrl
  const uniqueResultsMap = new Map<string, any>();

  for (const r of searchResults) {
    if (!uniqueResultsMap.has(r.sourceUrl)) {
      uniqueResultsMap.set(r.sourceUrl, {
        title: r.metadata?.title || r.docTitle || "Untitled Source",
        url: r.sourceUrl,
      });
    }
  }

  const uniqueReferences = Array.from(uniqueResultsMap.values()).map(
    (ref, idx) => ({
      id: idx + 1,
      title: ref.title,
      url: ref.url,
    })
  );

  // ✅ Build context string using textSnippets (even duplicates allowed)
  const context = searchResults
    .map(
      (r: any, i: number) =>
        `Source ${i + 1}:\n${r.textSnippet}\nSource URL: ${r.sourceUrl}\n`
    )
    .join("\n\n");

  const prompt = `
You are a research assistant. Generate a research report in **structured JSON**.

## Requirements:
1. The JSON object should have two fields:
   - "report": A string containing the main body of the report with Markdown formatting.
   - "references": An array of objects with { id, title, url } based on the provided search results.
2. Inline numbered citations like [1], [2] should refer to the "id" field in the references array.
3. Example output format:
{
  "report": "## Introduction ... text with [1], [2] ...",
  "references": [
    { "id": 1, "title": "Some Paper", "url": "https://example.com" },
    { "id": 2, "title": "Another Source", "url": "https://example2.com" }
  ]
}

Search query: "${query}"

Search Results:
${context}

Unique References (for citations):
${JSON.stringify(uniqueReferences, null, 2)}

If there are no relevant search results, return null.
  `;

  const keywordResp = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let parsed: {
    report: string;
    references: { id: number; title: string; url: string }[];
  } = {
    report: "",
    references: [],
  };

  try {
    parsed = JSON.parse(
      keywordResp.text?.trim().replace(/```json|```/g, "") ?? "{}"
    );
  } catch (e) {
    console.error("Failed to parse model response:", e);
  }

  return parsed;
}

