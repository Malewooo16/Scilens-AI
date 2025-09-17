"use server";

import {GoogleGenAI} from "@google/genai";
import {redirect} from "next/navigation";
import {cookies} from "next/headers";
import {prisma} from "@/db/prisma";
import { customAlphabet } from 'nanoid'
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";




const pdfParseModule = require("pdf-parse");

const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY!});

const client = new BedrockRuntimeClient({ region: "eu-north-1" });


import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set in .env
});
// ---------------------- Helper Functions ----------------------

/** Fetch PDF into memory from a URL */
async function fetchPdfBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch PDF: ${url}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    return buffer;
  } catch (err) {
    console.error("fetchPdfBuffer error:", err);
    return null;
  }
}

/** Split text into paragraphs */
function splitByParagraph(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** Split paragraph into sentences */
function splitBySentence(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.map((s) => s.trim());
}

/** Create chunks from text using paragraph/sentence method */
function createChunks(text: string, maxChars = 2000) {
  const paragraphs = splitByParagraph(text);
  const chunks: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= maxChars) {
      chunks.push(para);
    } else {
      const sentences = splitBySentence(para);
      let chunk = "";
      for (const sentence of sentences) {
        if ((chunk + " " + sentence).length > maxChars) {
          chunks.push(chunk);
          chunk = sentence;
        } else {
          chunk += (chunk ? " " : "") + sentence;
        }
      }
      if (chunk) chunks.push(chunk);
    }
  }

  return chunks;
}

/** Generate embedding using Gemini */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) return [];

  const response = await genAI.models.embedContent({
    model: "gemini-embedding-001", // Gemini embedding model
    contents: [text],
    config:{
      outputDimensionality: 1536, // Set to 1536 for Gemini
    }
  });

  if (response.embeddings && response.embeddings[0] && response.embeddings[0].values) {
  //  console.log("Generated embedding:", response.embeddings[0].values.length);
    // The vector is in response.embedding.values
    return response.embeddings[0].values;
  } else {
    console.warn("No embeddings generated for the provided text.");
    return [];
  }
}

import pdfParse from "pdf-parse";
import { fetchArxivPapers } from "./axrivfetch";
import { summarizePapers } from "./summarize";
import { generateTable } from "./generateTable";
import { criticizePapers } from "./criticize";
import { auth } from "@/auth";


const nanoid = customAlphabet("1234567890abcdef", 10);

export async function processPDFs(
  papers: {
    title: string;
    pdfBuffer: Buffer | null;
    metadata: Record<string, any>;
    sourceUrl: string;
  }[],
  researchQueryId: string,
  userId: string
) {
  console.log("Starting to process PDFs...");
  const processingPromises = papers.map(async (paper, index) => {
    if (!paper.pdfBuffer) return;

    console.log(`Processing paper ${index + 1} of ${papers.length}: ${paper.title}`);

    try {
      // 1. Extract text from PDF
      const parsed = await pdfParse(paper.pdfBuffer);
      const fullText = parsed.text || "";

      // 2. Save the document entry
      const document = await prisma.document.create({
        data: {
          title: paper.title,
          content: fullText,
          metadata: paper.metadata,
          sourceUrl: paper.sourceUrl,
          userId,
          researchQueryId,
        },
      });

      // 3. Split into chunks
      console.log(`Splitting text into chunks for: ${paper.title}`);
      const chunks = createChunks(fullText, 2000);
      console.log(`Created ${chunks.length} chunks for: ${paper.title}`);

      // 4. Generate embeddings for all chunks in parallel
      console.log(`Generating embeddings for ${chunks.length} chunks of: ${paper.title}`);
      const embeddingPromises = chunks.map(async (chunkText) => {
        const embeddingVector = await generateEmbedding(chunkText);
        return {
          chunkText,
          embeddingVector,
          documentId: document.id,
        };
      });

      const embeddings = await Promise.all(embeddingPromises);
      console.log(`Finished generating embeddings for: ${paper.title}`);

      // 5. Insert all embeddings in a single transaction
      console.log(`Inserting ${embeddings.length} embeddings into the database for: ${paper.title}`);
      
      const embeddingInserts = embeddings.map(embedding => prisma.$executeRawUnsafe(
        `
        INSERT INTO embedding (chunkText, embeddings, documentId, id)
        VALUES (?, ?, ?, ?);
        `,
        embedding.chunkText,
        `[${embedding.embeddingVector.join(",")}]`,
        embedding.documentId,
        nanoid()
      ));

      await prisma.$transaction(embeddingInserts);

      console.log(`Finished inserting embeddings for: ${paper.title}`);
    } catch (err) {
      console.error("processPDFs error for", paper.title, err);
    }
  });

  await Promise.all(processingPromises);
  console.log("Finished processing all PDFs.");
}



export async function searchDocumentsOnDemand(researchQueryId: string, tab: 'table' | 'gaps' | 'visualizations') {
  console.log(`Handling on-demand request for research query ${researchQueryId}, tab: ${tab}`);

  const documents = await prisma.document.findMany({
    where: { researchQueryId: researchQueryId },
  });

  const paperContents = documents.map(doc => ({ sourceUrl: doc.sourceUrl || '', content: doc.content }));

  if (tab === 'table') {
    console.log("Generating table from the papers...");
    const table = await generateTable(paperContents);
    await prisma.researchQuery.update({
      where: { id: researchQueryId },
      data: { table },
    });
    console.log("Finished generating table.");
  } else if (tab === 'gaps') {
    console.log("Criticizing the papers...");
    const gaps = await criticizePapers(paperContents);
    await prisma.researchQuery.update({
      where: { id: researchQueryId },
      data: { gaps },
    });
    console.log("Finished criticizing papers.");
  }
}
// ---------------------- Main Server Action ----------------------


export async function searchDocuments(formData: FormData): Promise<{ success: boolean; redirectPath?: string; error?: string; redirectToPricing?: boolean }> {
  const query = formData.get("query")?.toString().trim();
  if (!query) return { success: false, error: "Query cannot be empty." };

  console.log(`Starting search for query: "${query}"`);
  const startTime = Date.now();

  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "User not authenticated.", redirectPath: "/api/auth/signin" };
    }

    // Check daily query limit
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of today

    const researchQueriesToday = await prisma.researchQuery.count({
      where: {
        userId: userId,
        createdAt: {
          gte: today,
        },
      },
    });

    if (researchQueriesToday >= 2) {
      return { success: false, error: "Daily research query limit reached. Please subscribe to Pro for unlimited queries.", redirectToPricing: true };
    }

    // Step 1: Extract keywords
    console.log("Step 1: Extracting keywords...");
    const keywordResp = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract 2 precise search keywords for this research topic: "${query}". Return as JSON array of strings.`, 
    });
    const keywordsArray: string[] = JSON.parse(
      (keywordResp.text ?? "").trim().replace(/```json|```/g, "")
    );
    const keywords = keywordsArray.join(" ");
    console.log(`Keywords extracted: ${keywords}`);

    // Step 2: Generate enhanced research query
    console.log("Step 2: Generating enhanced research query...");
    const enhancedResp = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Given the research topic "${query}" and keywords ${keywordsArray.join(
        ", "
      )}, return an enhanced research query with proper focus and clear without unessary articles like "A comparative, The Study" return single sentence only.`, 
    });
    const enhancedQuery = (enhancedResp.text ?? "").trim();
    console.log("Enhanced Query:", enhancedQuery);

    // Step 3: Create research query entry in DB
    console.log("Step 3: Creating research query entry in DB...");
    const researchQuery = await prisma.researchQuery.create({
      data: {
        originalQuery: query,
        enhancedQuery,
        userId: userId,
      },
    });
    console.log(`Research query created with ID: ${researchQuery.id}`);

    // Step 4: Fetch papers from arXiv
    console.log("Step 4: Fetching papers from arXiv...");
    const arxivPapers = await fetchArxivPapers(keywords);
    console.log(`Fetched ${arxivPapers.length} papers from arXiv.`);

    // Step 5: Process PDFs and store chunks/embeddings
    console.log("Step 5: Processing PDFs and storing chunks/embeddings...");
    await processPDFs(
      arxivPapers,
      researchQuery.id,
      userId
    );
    console.log("Finished processing PDFs.");

    // Step 6: Summarize the papers
    console.log("Step 6: Summarizing the papers...");
    const documents = await prisma.document.findMany({
      where: { researchQueryId: researchQuery.id },
    });

    const paperContents = documents.map(doc => ({ sourceUrl: doc.sourceUrl || '', content: doc.content }));

    const summary = await summarizePapers(paperContents);

    await prisma.researchQuery.update({
      where: { id: researchQuery.id },
      data: { summary },
    });
    console.log("Finished summarizing papers.");

    const endTime = Date.now();
    console.log(`Total search process took ${endTime - startTime}ms`);

    return { success: true, redirectPath: `/results/${researchQuery.id}` };
  } catch (err: any) {
    console.error("searchDocuments main error:", err);
    return { success: false, error: err.message || "An unknown error occurred." };
  }
}
