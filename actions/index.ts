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

  //console.log("Generated embedding:", response.embeddings[0].values.length);
  // The vector is in response.embedding.values
  if (response.embeddings && response.embeddings[0]?.values) {
    return response.embeddings[0].values;
  }
  return [];
}

import pdfParse from "pdf-parse";
import { fetchArxivPapers } from "./axrivfetch";


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
  for (const paper of papers) {
    if (!paper.pdfBuffer) continue;

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
      const chunks = createChunks(fullText, 2000);
        for (let pos = 0; pos < chunks.length; pos++) {
      const chunkText = chunks[pos];
      const embeddingVector = await generateEmbedding(chunkText);

      await prisma.$executeRawUnsafe(
        `
        INSERT INTO embedding (\`chunkText\`, \`embeddings\`, \`documentId\`, \`id\`)
        VALUES (?, ?, ?, ?);
        `,
        chunkText,
        `[${embeddingVector.join(",")}]`,
        document.id,
        nanoid()
      );
    }

    } catch (err) {
      console.error("processPDFs error for", paper.title, err);
      continue;
    }
  }
}


// ---------------------- Main Server Action ----------------------

export async function searchDocuments(formData: FormData) {
  const query = formData.get("query")?.toString().trim();
  if (!query) return redirect("/error");

  let redirectPath: string | null = null;

  try {
    // Step 1: Extract keywords
    const keywordResp = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract 2 precise search keywords for this research topic: "${query}". Return as JSON array of strings.`,
    });
    const keywordsArray: string[] = JSON.parse(
      (keywordResp.text ?? "").trim().replace(/```json|```/g, "")
    );
    const keywords = keywordsArray.join(" ");

    // Step 2: Generate enhanced research query
    const enhancedResp = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Given the research topic "${query}" and keywords ${keywordsArray.join(
        ", "
      )}, return an enhanced research query with proper focus and clear without unessary articles like "A comparative, The Study" return single sentence only.`,
    });
    const enhancedQuery = (enhancedResp.text ?? "").trim();

    console.log("Enhanced Query:", enhancedQuery);
    // Step 3: Create research query entry in DB
    const researchQuery = await prisma.researchQuery.create({
      data: {
        originalQuery: query,
        enhancedQuery,
        userId: "cmf1cyaam0000sws0zf5fp9lm", // replace with session user ID
      },
    });

    // Step 4: Fetch papers from arXiv
    const arxivPapers = await fetchArxivPapers(keywords);

    // Step 5: Process PDFs and store chunks/embeddings
    await processPDFs(
      arxivPapers,
      researchQuery.id,
      "cmf1cyaam0000sws0zf5fp9lm"
    );

  

    redirectPath = `/results/${researchQuery.id}`;
  } catch (err) {
    console.error("searchDocuments main error:", err);
    redirect("/error");
  } finally {
    if (redirectPath) redirect(redirectPath);
  }
}
