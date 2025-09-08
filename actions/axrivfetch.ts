async function fetchPdfBuffer(pdfUrl: string): Promise<Buffer | null> {
  try {
    const resp = await fetch(pdfUrl);
    if (!resp.ok) return null;
    const arrayBuffer = await resp.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.warn("Failed to fetch PDF:", pdfUrl, err);
    return null;
  }
}

interface ArxivPaper {
  title: string;
  pdfBuffer: Buffer | null;
  metadata: Record<string, any>;
  sourceUrl: string;
}

export async function fetchArxivPapers(
  keywords: string,
  minPapers = 4
): Promise<ArxivPaper[]> {
  const formattedKeywords = keywords
    .split(" ")
    .map((k) => `"${k}"`)
    .join("+AND+");
  const maxResults = 20; // large enough to get at least minPapers

  const url = `http://export.arxiv.org/api/query?search_query=all:${formattedKeywords}&max_results=${maxResults}&sortBy=relevance`;

  try {
    const resp = await fetch(url);
    const text = await resp.text();
    const entries = [...text.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

    if (entries.length < minPapers) {
      console.warn(`Only found ${entries.length} papers for "${keywords}"`);
    }

    // Map entries to metadata first
    const papersMetadata = entries.slice(0, minPapers).map((entryMatch) => {
      const entryText = entryMatch[1];

      const getTag = (tag: string) => {
        const m = entryText.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return m ? m[1].trim() : null;
      };

      const getMultipleTags = (tag: string) => {
        const matches = [
          ...entryText.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g")),
        ];
        return matches.map((m) => m[1].trim());
      };

      const title = getTag("title") || "Untitled Paper";
      const authors = getMultipleTags("name");
      const arxivIdMatch = entryText.match(/<id>(.*?)<\/id>/);
      const sourceUrl = arxivIdMatch ? arxivIdMatch[1].trim() : "";

      const pdfMatch = entryText.match(
        /<link[^>]+title="pdf"[^>]+href="([^"]+)"/
      );
      const pdfUrl = pdfMatch ? pdfMatch[1] : null;

      const metadata = {
        title,
        authors,
        published: getTag("published"),
        updated: getTag("updated"),
        doi: getTag("arxiv:doi"),
        journalRef: getTag("arxiv:journal_ref"),
        categories: getMultipleTags("category").map((c) => {
          const termMatch = c.match(/term="([^"]+)"/);
          return termMatch ? termMatch[1] : c;
        }),
        comments: getTag("arxiv:comment"),
      };

      return { title, pdfUrl, metadata, sourceUrl };
    });

    // Fetch PDFs in parallel
    const papers: ArxivPaper[] = await Promise.all(
      papersMetadata.map(async ({ title, pdfUrl, metadata, sourceUrl }) => {
        const pdfBuffer = pdfUrl ? await fetchPdfBuffer(pdfUrl) : null;
        return { title, pdfBuffer, metadata, sourceUrl };
      })
    );

    return papers;
  } catch (err) {
    console.error("fetchArxivPapers error:", err);
    return [];
  }
}