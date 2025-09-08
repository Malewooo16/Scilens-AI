"use server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/db/prisma";
import { chatBot } from "./chat";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

/**
 * Extracts keywords from the research query using Gemini.
 */
export async function generateKeywords(query: string) {
  const prompt = `
    You are a research assistant. Your task is to extract relevant keywords from the following research query for data extraction.

    ## Research Query:
    ${query}

    ## Instructions:
    1. Identify the key concepts and entities in the research query.
    2. Generate a list of keywords that can be used to find relevant data.
    3. Format the output as a JSON object with a "keywords" key, which is an array of strings.

    ## Example:
    Research Query: "What are the latest advancements in AI for drug discovery?"
    Output:
    {
      "keywords": ["AI", "drug discovery", "advancements", "machine learning", "pharmaceuticals"]
    }
  `;

  const keywordsResp = await genAI.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  let parsed: { keywords: string[] } = { keywords: [] };

  try {
    parsed = JSON.parse(
      keywordsResp.text?.trim().replace(/```json|```/g, "") ?? "{}"
    );
  } catch (e) {
    console.error("Failed to parse model response:", e);
  }

  return parsed.keywords;
}

/**
 * Extracts numerical data from text and suggests relevant visualizations.
 */
export async function generateVisualizations(report: string, query: string) {
  const prompt = `
    You are a data visualization expert. Your task is to extract numerical data from the following text and suggest visualizations that are directly relevant to the research query.

    ## Research Query:
    ${query}

    ## Instructions:
    1. Carefully analyze the research query to understand the main topic and the key aspects to be visualized.
    2. Identify interesting numerical data in the text that is directly relevant to the research query.
    3. For each piece of data, suggest a chart type (e.g., "bar", "line", "pie").
    4. Format the output as a JSON object with a "visualizations" key.
    5. The "visualizations" key should be an array of objects, where each object has:
        * "title": A title for the chart that reflects its relevance to the research query.
        * "type": The suggested chart type (should be bar or pie chart if needed).
        * "data": The data for the chart, as an array of objects.

    ## Example:
    Research Query: "Comparing the effectiveness of different fertilizers on plant growth."
    Text: "Fertilizer A resulted in 15cm of growth, while Fertilizer B resulted in 10cm of growth."
    Output:
    {
      "visualizations": [
        {
          "title": "Effectiveness of Fertilizers on Plant Growth",
          "type": "bar",
          "data": [
            { "name": "Fertilizer A", "value": 15 },
            { "name": "Fertilizer B", "value": 10 }
          ]
        }
      ]
    }
    
    6. Ensure that the visualizations are directly relevant to the research query and provide meaningful insights.
    7. Ensure the name property in data objects is present and concise (e.g., "Fertilizer A", "Category 1").

    ## Text to process:
    ${report}
  `;

  const vizResp = await genAI.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  let parsed: {
    visualizations: { title: string; type: string; data: any[] }[];
  } = {
    visualizations: [],
  };

  try {
    parsed = JSON.parse(
      vizResp.text?.trim().replace(/```json|```/g, "") ?? "{}"
    );
  } catch (e) {
    console.error("Failed to parse model response:", e);
  }

  return parsed;
}

/**
 * Main pipeline: extract keywords -> fetch report per keyword -> generate visualizations -> store in DB.
 */
export async function generateAndStoreVisualizations(
  researchQueryId: string,
  query: string
) {
  const researchQuery = await prisma.researchQuery.findUnique({
    where: { id: researchQueryId },
    include: { documents: true },
  });

  if (!researchQuery) {
    throw new Error("Research query not found");
  }

  // Step 1: Extract keywords
  const keywords = await generateKeywords(query);

  // Step 2: Query chatbot per keyword (parallelized for efficiency)
  const keywordReports = await Promise.all(
    keywords.map(async (kw) => {
      const resp = await chatBot(kw);
      return resp.answer as string;
    })
  );

  // Step 3: Merge reports for broader coverage
  const mergedReport = keywordReports.join("\n\n");

  // Step 4: Generate visualizations from merged report
  const visualizations = await generateVisualizations(mergedReport, query);

  // Step 5: Store in DB
  await prisma.researchQuery.update({
    where: { id: researchQueryId },
    data: { visualizations: visualizations as any },
  });

  return visualizations;
}
