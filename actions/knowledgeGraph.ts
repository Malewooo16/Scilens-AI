"use server";
import { prisma } from "@/db/prisma";
import { GoogleGenAI } from "@google/genai";
import { searchDocs } from "./vector";

const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY!});

export async function generateAndStoreKnowledgeGraph(researchQueryId: string) {
  const researchQuery = await prisma.researchQuery.findUnique({
    where: { id: researchQueryId },
  });

  if (!researchQuery || !researchQuery.enhancedQuery) {
    throw new Error("Research query not found or enhanced query is missing.");
  }

  const searchResults = await searchDocs(researchQuery.enhancedQuery, researchQueryId, 20);

  const context = searchResults
    .map(
      (r: any, i: number) =>
        `Source ${i + 1}:
${r.textSnippet}
Source URL: ${r.sourceUrl}
`
    )
    .join("\n\n");

    const uniqueReferences = Array.from(new Set(searchResults.map((r: any) => r.sourceUrl))).map((url, idx) => ({
        id: idx + 1,
        title: (() => {
          const found = searchResults.find((r: any) => r.sourceUrl === url);
          return found?.metadata?.title || 'Untitled Source';
        })(),
        url: url,
      }));

  const prompt = `
You are a knowledge graph expert. Your task is to extract entities and their relationships from the following text.

## Instructions:
1.  Identify the key entities in the text. An entity can be a person, organization, location, concept, etc.
2.  Identify the relationships between these entities. A relationship should have a source entity, a target entity, and a label describing the relationship.
3.  Ensure that each entity is unique and relationships accurately reflect the connections in the text.
4.  Keep the nodes and edges simple, concise and relevant to the main topics discussed in the text.
5.  Format the output as a JSON object with three keys: "nodes", "edges", and "references".
    *   "nodes" should be an array of objects, where each object has an "id" (the entity name) and a "label" (the entity name).
    *   "edges" should be an array of objects, where each object has a "source" (the ID of the source entity), a "target" (the ID of the target entity), and a "label" (the description of the relationship).
    *   "references" should be an array of objects with { id, title, url } based on the provided search results.

## Example:
Text: "CRISPR technology can be used to edit the genome of plants. This affects gene expression."
Output:
{
  "nodes": [
    { "id": "CRISPR", "label": "CRISPR" },
    { "id": "gene expression", "label": "gene expression" },
    { "id": "plants", "label": "plants" }
  ],
  "edges": [
    { "source": "CRISPR", "target": "gene expression", "label": "affects" },
    { "source": "CRISPR", "target": "plants", "label": "in" }
  ],
  "references": []
}

## Text to process:
${context}

## Unique References (for citations):
${JSON.stringify(uniqueReferences, null, 2)}
  `;

  const keywordResp = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let parsed: {
    nodes: { id: string; label: string }[];
    edges: { source: string; target: string; label: string }[];
    references: { id: number; title: string; url: string }[];
  } = {
    nodes: [],
    edges: [],
    references: [],
  };

  try {
    parsed = JSON.parse(
      keywordResp.text?.trim().replace(/```json|```/g, "") ?? "{}"
    );
  } catch (e) {
    console.error("Failed to parse model response:", e);
  }

  await prisma.researchQuery.update({
    where: { id: researchQueryId },
    data: { knowledgeGraph: parsed },
  });

  return parsed;
}