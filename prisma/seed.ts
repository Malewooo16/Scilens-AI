// // import { PrismaClient } from '@prisma/client';



// // const prisma = new PrismaClient();

// // async function main() {
// //     const users = [
// //         { name: 'Alice', email: 'alice@example.com', password: 'password123' },
// //         { name: 'Bob', email: 'bob@example.com', password: 'password123' },
// //         { name: 'Charlie', email: 'charlie@example.com' , password: 'password123' },
// //     ];

// //     for (const user of users) {
// //         await prisma.user.upsert({
// //             where: { email: user.email },
// //             update: {},
// //             create: user,
// //         });
// //     }

// //     console.log('Seeded users successfully.');
// // }

// // main()
// //     .catch((e) => {
// //         console.error(e);
// //         process.exit(1);
// //     })
// //     .finally(async () => {
// //         await prisma.$disconnect();
// //     });


// // Node.js script to fetch arXiv papers by keywords
// // Requires node-fetch: npm install node-fetch

// import { parseStringPromise } from "xml2js"; // npm install xml2js

// async function fetchArxivPapers(keywords, maxResults = 10) {
//   // Construct the search query
//   const query = encodeURIComponent(keywords.join(" AND "));
//   const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=${maxResults}`;

//   try {
//     const response = await fetch(url);
//     const xmlText = await response.text();

//     // Parse XML to JS object
//     const result = await parseStringPromise(xmlText);
//     const entries = result.feed.entry || [];

//     const papers = entries.map((entry) => ({
//       title: entry.title[0].trim(),
//       authors: entry.author.map((a) => a.name[0]),
//       summary: entry.summary[0].trim(),
//       published: entry.published[0],
//       link: entry.id[0],
//     }));

//     return papers;
//   } catch (error) {
//     console.error("Error fetching arXiv papers:", error);
//     return [];
//   }
// }

// // Example usage
// (async () => {
//   const keywords = ["machine learning", "stock prediction"];
//   const papers = await fetchArxivPapers(keywords, 10);
//   console.log(papers.length);
// })();
