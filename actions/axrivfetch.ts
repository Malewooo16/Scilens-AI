import { parseStringPromise } from "xml2js";

interface ArxivPaper {
  pdfUrl: any;
  title: string;
  pdfBuffer: Buffer | null;
  metadata: {
    title: string;
    authors: string[];
    published: string | null;
    updated: string | null;
    doi: string | null;
    journalRef: string | null;
    comments: string | null;
    categories: string[];
  };
  sourceUrl: string;
}

interface ArxivLink {
  $: {
    title?: string;
    href: string;
  };
}

interface ArxivAuthor {
  name: string;
}

interface ArxivCategory {
  $: {
    term: string;
  };
}

interface ArxivEntry {
  title?: { _: string };
  id: string;
  author: ArxivAuthor | ArxivAuthor[];
  link?: ArxivLink | ArxivLink[];
  published?: string;
  updated?: string;
  "arxiv:doi"?: { _: string };
  "arxiv:journal_ref"?: { _: string };
  "arxiv:comment"?: { _: string };
  category?: ArxivCategory | ArxivCategory[];
}

interface ArxivFeed {
  feed: {
    entry?: ArxivEntry | ArxivEntry[];
  };
}

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

export async function fetchArxivPapers(
  keywords: string,
  minPapers = 4
): Promise<ArxivPaper[]> {
  const formattedKeywords = keywords
    .split(" ")
    .map((k) => `"${k}"`)
    .join("+AND+");
  const maxResults = 4;

  const url = `http://export.arxiv.org/api/query?search_query=all:${formattedKeywords}&max_results=${maxResults}&sortBy=relevance`;

  try {
    const resp = await fetch(url);
    const text = await resp.text();

    const parsed = (await parseStringPromise(text, {
      explicitArray: false,
    })) as ArxivFeed;

    let entries = parsed.feed.entry;

    if (!entries) {
      console.warn(`No papers found for "${keywords}"`);
      return [];
    }

    if (!Array.isArray(entries)) entries = [entries];

    if (entries.length < minPapers) {
      console.warn(`Only found ${entries.length} papers for "${keywords}"`);
    }
    console.log(`Found ${entries.length} papers for "${keywords}"`);

    const results: ArxivPaper[] = [];

    for (const entry of entries) {
      let title = "Untitled Paper";
      if (entry.title && typeof entry.title === 'string') {
        title = (entry.title as string).trim();
      } else if (entry.title && typeof entry.title._ === 'string') {
        title = entry.title._.trim();
      }

      const authors = Array.isArray(entry.author)
        ? entry.author.map((a) => a.name)
        : entry.author
        ? [entry.author.name]
        : [];

      const sourceUrl = entry.id;

      // Find PDF link
      let pdfUrl: string | null = null;
      if (entry.link) {
        const links = Array.isArray(entry.link) ? entry.link : [entry.link];
        const pdfLink = links.find((l) => l.$.title === "pdf");
        pdfUrl = pdfLink?.$.href ?? null;
      }

      const categories = entry.category
        ? Array.isArray(entry.category)
          ? entry.category.map((c) => c.$.term)
          : [entry.category.$.term]
        : [];

      const metadata = {
        title,
        authors,
        published: entry.published ?? null,
        updated: entry.updated ?? null,
        doi: entry["arxiv:doi"]?._ ?? null,
        journalRef: entry["arxiv:journal_ref"]?._ ?? null,
        comments: entry["arxiv:comment"]?._ ?? null,
        categories,
      };

      if (pdfUrl) {
        results.push({
          title,
          pdfBuffer: null,
          metadata,
          sourceUrl,
          pdfUrl,
        });
      }
    }

    const papers: ArxivPaper[] = await Promise.all(
      results.map(async (r) => {
        const pdfBuffer = await fetchPdfBuffer(r.pdfUrl);
        return {
          title: r.title,
          pdfUrl: r.pdfUrl,

          pdfBuffer,
          metadata: r.metadata,
          sourceUrl: r.sourceUrl,
        };
      })
    );

    return papers;
  } catch (err) {
    console.error("fetchArxivPapers error:", err);
    return [];
  }
}
