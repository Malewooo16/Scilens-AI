//@ts-nocheck
/**
 * @file export_pdf.ts
 * @description This file provides a robust function for generating a well-formatted PDF from a research query.
 * It intelligently parses and formats text content, including titles, paragraphs, bullet points, and tables,
 * and handles page breaks to ensure content fits properly on each page.
 * It uses the pdf-lib library, which is a self-contained solution.
 */

"use server";
import { prisma } from "@/db/prisma";
import { PDFDocument, PDFFont, rgb, StandardFonts, LineCapStyle } from "pdf-lib";

export async function exportPdf(researchQueryId: string): Promise<Uint8Array> {
  // Fetch the research query from the database using Prisma.
  const researchQuery = await prisma.researchQuery.findUnique({
    where: { id: researchQueryId },
  });

  // Throw an error if the query is not found.
  if (!researchQuery) {
    throw new Error("Research query not found");
  }

  // Create a new PDF document and add the first page.
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Embed standard fonts for text and titles.
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Define constants for styling and layout.
  const FONT_SIZE_TEXT = 12;
  const FONT_SIZE_TITLE = 18;
  const FONT_SIZE_SUBTITLE = 14;
  const LINE_HEIGHT_TEXT = 15;
  const LINE_HEIGHT_TITLE = 30;
  const LINE_HEIGHT_SUBTITLE = 20;
  const BULLET_INDENT = 20;
  const TABLE_CELL_PADDING = 5;
  const TABLE_LINE_THICKNESS = 1;

  /**
   * Checks for remaining space on the current page. If there is not enough,
   * a new page is added and the y-coordinate is reset.
   * @param requiredSpace The minimum space needed for the next content block.
   */
  const ensureSpace = (requiredSpace: number) => {
    if (y - requiredSpace < margin) {
      page = pdfDoc.addPage();
      y = height - margin;
    }
  };

  /**
   * Wraps text into lines that fit within the specified maxWidth.
   * This is a utility function for simple text.
   * @param text The text to wrap.
   * @param maxWidth The maximum width for each line.
   * @param font The font used for measurement.
   * @param fontSize The font size used for measurement.
   * @returns An array of wrapped lines.
   */
  const wrapText = (text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  /**
   * Draws a main title on the page using a bold font.
   * @param text The title text to be drawn.
   */
  const drawTitle = (text: string) => {
    const textWidth = width - 2 * margin;
    const lines = wrapText(text, textWidth, boldFont, FONT_SIZE_TITLE);
    const requiredSpace = lines.length * LINE_HEIGHT_TITLE;
    ensureSpace(requiredSpace);
    let currentY = y;
    for (const line of lines) {
      page.drawText(line, {
        x: margin,
        y: currentY,
        font: boldFont,
        size: FONT_SIZE_TITLE,
        color: rgb(0, 0, 0),
      });
      currentY -= LINE_HEIGHT_TITLE;
    }
    y = currentY;
  };

  /**
   * Draws a subtitle on the page using a bold font.
   * @param text The subtitle text to be drawn.
   */
  const drawSubtitle = (text: string) => {
    const textWidth = width - 2 * margin;
    const lines = wrapText(text, textWidth, boldFont, FONT_SIZE_SUBTITLE);
    const requiredSpace = lines.length * LINE_HEIGHT_SUBTITLE + 10; // Extra spacing
    ensureSpace(requiredSpace);
    y -= 10; // Add some vertical spacing before the subtitle.
    let currentY = y;
    for (const line of lines) {
      page.drawText(line, {
        x: margin,
        y: currentY,
        font: boldFont,
        size: FONT_SIZE_SUBTITLE,
        color: rgb(0, 0, 0),
      });
      currentY -= LINE_HEIGHT_SUBTITLE;
    }
    y = currentY;
  };

  /**
   * A new and corrected function to handle all formatted text drawing, including paragraphs and lists.
   * It properly handles line wrapping and bold text.
   * @param text The content to parse and draw.
   * @param startingX The starting x-coordinate for the text.
   * @param maxWidth The maximum width for a single line of text.
   * @param bulletText Optional text to draw as a bullet point.
   */
  const drawFormattedText = (text: string, startingX: number, maxWidth: number, bulletText?: string) => {
    if (!text.trim()) return;

    // Tokenize the text into bold and regular parts.
    const tokens = text.split(/(\*\*.*?\*\*)/g).filter(Boolean).map(part => ({
      text: part.startsWith('**') && part.endsWith('**') ? part.slice(2, -2) : part,
      isBold: part.startsWith('**') && part.endsWith('**'),
    }));

    // Perform line wrapping first to get all the lines.
    const lines: Array<{ text: string; isBold: boolean; }[][]> = [];
    let currentLine: { text: string; isBold: boolean; }[][] = [];
    let currentLineWidth = 0;

    tokens.forEach(token => {
      const fontToUse = token.isBold ? boldFont : font;
      const words = token.text.split(' ');
      words.forEach(word => {
        const wordWidth = fontToUse.widthOfTextAtSize(word, FONT_SIZE_TEXT);
        const spaceWidth = font.widthOfTextAtSize(' ', FONT_SIZE_TEXT);

        if (currentLineWidth + wordWidth + (currentLineWidth > 0 ? spaceWidth : 0) > maxWidth) {
          lines.push(currentLine);
          currentLine = [];
          currentLineWidth = 0;
        }

        const newText = currentLineWidth > 0 ? ` ${word}` : word;
        currentLine.push([{ text: newText, isBold: token.isBold }]);
        currentLineWidth += fontToUse.widthOfTextAtSize(newText, FONT_SIZE_TEXT);
      });
    });
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    const requiredSpace = lines.length * LINE_HEIGHT_TEXT;
    ensureSpace(requiredSpace);

    let currentY = y;
    lines.forEach((lineTokens, index) => {
      let currentX = startingX;
      if (index === 0 && bulletText) {
        page.drawText(bulletText, { x: margin, y: currentY, font, size: FONT_SIZE_TEXT, color: rgb(0, 0, 0) });
      }

      lineTokens.forEach(tokenGroup => {
        tokenGroup.forEach(token => {
          const fontToUse = token.isBold ? boldFont : font;
          page.drawText(token.text, {
            x: currentX,
            y: currentY,
            font: fontToUse,
            size: FONT_SIZE_TEXT,
            color: rgb(0, 0, 0)
          });
          currentX += fontToUse.widthOfTextAtSize(token.text, FONT_SIZE_TEXT);
        });
      });
      currentY -= LINE_HEIGHT_TEXT;
    });

    y = currentY;
  };

  /**
   * Draws a markdown table, handling multi-page rendering.
   * @param markdown The markdown table string.
   */
  const drawTable = (markdown: string) => {
    const lines = markdown.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    if (lines.length < 3 || !lines[1].includes('---')) return drawFormattedText(markdown, margin, width - 2 * margin);

    const headers = lines[0].split('|').map(s => s.trim()).filter(s => s);
    const separator = lines[1].split('|').map(s => s.trim()).filter(s => s);
    const alignments = separator.map(sep => {
      if (sep.startsWith(':') && sep.endsWith(':')) return 'center';
      if (sep.endsWith(':')) return 'right';
      return 'left';
    });
    const rows = lines.slice(2).map(l => l.split('|').map(s => s.trim()).filter(s => s));

    const numCols = headers.length;
    const tableWidth = width - 2 * margin;
    const colWidths = Array(numCols).fill(tableWidth / numCols);

    // Prepare wrapped text and heights for all rows, including headers.
    const allRowsData = [headers, ...rows];
    const preparedRows = allRowsData.map((rowData, rIndex) => {
      const rowContent = rowData.map((cellText, cIndex) => {
        const cellFont = rIndex === 0 ? boldFont : font;
        const maxW = colWidths[cIndex] - 2 * TABLE_CELL_PADDING;
        return {
          lines: wrapText(cellText || '', maxW, cellFont, FONT_SIZE_TEXT),
          font: cellFont,
          align: alignments[cIndex],
        };
      });
      const maxLines = Math.max(...rowContent.map(cell => cell.lines.length));
      const rowHeight = maxLines * LINE_HEIGHT_TEXT + 2 * TABLE_CELL_PADDING;
      return { content: rowContent, height: rowHeight, isHeader: rIndex === 0 };
    });

    // Function to draw the table headers.
    const drawHeaders = (starty: number) => {
      const headerRow = preparedRows[0];
      const headerHeight = headerRow.height;
      let currentY = starty;
      
      // Draw top horizontal line of the header.
      page.drawLine({
        start: { x: margin, y: currentY },
        end: { x: margin + tableWidth, y: currentY },
        thickness: TABLE_LINE_THICKNESS,
        color: rgb(0, 0, 0),
        lineCap: LineCapStyle.Square,
      });

      // Draw header text and vertical lines.
      let currentColX = margin;
      headerRow.content.forEach((cell, cIndex) => {
        let textY = currentY - TABLE_CELL_PADDING - FONT_SIZE_TEXT; // Corrected initial Y for text baseline
        const cellWidth = colWidths[cIndex];

        cell.lines.forEach(line => {
          const textWidth = cell.font.widthOfTextAtSize(line, FONT_SIZE_TEXT);
          let textX = currentColX + TABLE_CELL_PADDING;

          if (cell.align === 'center') {
            textX += (cellWidth - textWidth - 2 * TABLE_CELL_PADDING) / 2;
          } else if (cell.align === 'right') {
            textX += cellWidth - textWidth - 2 * TABLE_CELL_PADDING;
          }

          page.drawText(line, {
            x: textX,
            y: textY,
            size: FONT_SIZE_TEXT,
            font: cell.font,
            color: rgb(0, 0, 0),
          });
          textY -= LINE_HEIGHT_TEXT;
        });

        // Draw vertical line after column.
        page.drawLine({
          start: { x: currentColX, y: currentY },
          end: { x: currentColX, y: currentY - headerHeight },
          thickness: TABLE_LINE_THICKNESS,
          color: rgb(0, 0, 0),
          lineCap: LineCapStyle.Square,
        });

        currentColX += colWidths[cIndex];
      });

      // Draw final vertical line.
      page.drawLine({
        start: { x: currentColX, y: currentY },
        end: { x: currentColX, y: currentY - headerHeight },
        thickness: TABLE_LINE_THICKNESS,
        color: rgb(0, 0, 0),
        lineCap: LineCapStyle.Square,
      });
      
      // Draw bottom horizontal line of the header.
      page.drawLine({
        start: { x: margin, y: currentY - headerHeight },
        end: { x: margin + tableWidth, y: currentY - headerHeight },
        thickness: TABLE_LINE_THICKNESS,
        color: rgb(0, 0, 0),
        lineCap: LineCapStyle.Square,
      });

      return currentY - headerHeight;
    };

    // Draw the table, row by row.
    let tableY = y;
    
    // Draw the header first.
    ensureSpace(preparedRows[0].height + TABLE_LINE_THICKNESS);
    tableY = drawHeaders(tableY);
    y = tableY; // Update global y after header

    // Draw subsequent rows, handling page breaks.
    for (let i = 1; i < preparedRows.length; i++) {
      const row = preparedRows[i];
      const rowHeight = row.height;

      // Check for space for the next row.
      if (y - rowHeight - TABLE_LINE_THICKNESS < margin) {
        page = pdfDoc.addPage();
        y = height - margin;
        // Don't draw the header on new pages
      }
      
      let currentRowTopY = y;
      let currentColX = margin;

      // Draw horizontal line for the row top.
      page.drawLine({
        start: { x: margin, y: currentRowTopY },
        end: { x: margin + tableWidth, y: currentRowTopY },
        thickness: TABLE_LINE_THICKNESS,
        color: rgb(0, 0, 0),
        lineCap: LineCapStyle.Square,
      });

      row.content.forEach((cell, cIndex) => {
        let textY = currentRowTopY - TABLE_CELL_PADDING - FONT_SIZE_TEXT;
        const cellWidth = colWidths[cIndex];

        cell.lines.forEach(line => {
          const textWidth = cell.font.widthOfTextAtSize(line, FONT_SIZE_TEXT);
          let textX = currentColX + TABLE_CELL_PADDING;

          if (cell.align === 'center') {
            textX += (cellWidth - textWidth - 2 * TABLE_CELL_PADDING) / 2;
          } else if (cell.align === 'right') {
            textX += cellWidth - textWidth - 2 * TABLE_CELL_PADDING;
          }

          page.drawText(line, {
            x: textX,
            y: textY,
            size: FONT_SIZE_TEXT,
            font: cell.font,
            color: rgb(0, 0, 0),
          });
          textY -= LINE_HEIGHT_TEXT;
        });

        // Draw vertical line after column.
        page.drawLine({
          start: { x: currentColX, y: currentRowTopY },
          end: { x: currentColX, y: currentRowTopY - rowHeight },
          thickness: TABLE_LINE_THICKNESS,
          color: rgb(0, 0, 0),
          lineCap: LineCapStyle.Square,
        });
        currentColX += colWidths[cIndex];
      });
      
      // Draw final vertical line for the row.
      page.drawLine({
        start: { x: currentColX, y: currentRowTopY },
        end: { x: currentColX, y: currentRowTopY - rowHeight },
        thickness: TABLE_LINE_THICKNESS,
        color: rgb(0, 0, 0),
        lineCap: LineCapStyle.Square,
      });

      // Draw bottom horizontal line of the row.
      page.drawLine({
        start: { x: margin, y: currentRowTopY - rowHeight },
        end: { x: margin + tableWidth, y: currentRowTopY - rowHeight },
        thickness: TABLE_LINE_THICKNESS,
        color: rgb(0, 0, 0),
        lineCap: LineCapStyle.Square,
      });

      y -= rowHeight;
    }
    
    y -= 20; // Space after table
  };

  /**
   * Parses the content string line by line, grouping paragraphs and handling markdown-like elements.
   * @param content The string content to parse and render.
   */
  const parseAndDrawContent = (content: string) => {
    const lines = content.split(/\r?\n/);
    let currentParagraph = '';
    let isInsideTable = false;
    let tableBuffer: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|') || (isInsideTable && trimmed.startsWith('|'))) {
        isInsideTable = true;
        tableBuffer.push(line);
        continue;
      } else if (isInsideTable) {
        drawTable(tableBuffer.join('\n'));
        isInsideTable = false;
        tableBuffer = [];
      }
      
      if (trimmed === '') {
        if (currentParagraph) {
          drawFormattedText(currentParagraph.trim().replace(/\s+/g, ' '), margin, width - 2 * margin);
          currentParagraph = '';
        }
        y -= LINE_HEIGHT_TEXT / 2;
        continue;
      }
      
      if (trimmed.startsWith('## ')) {
        if (currentParagraph) {
          drawFormattedText(currentParagraph.trim().replace(/\s+/g, ' '), margin, width - 2 * margin);
          currentParagraph = '';
        }
        drawSubtitle(trimmed.substring(3));
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        if (currentParagraph) {
          drawFormattedText(currentParagraph.trim().replace(/\s+/g, ' '), margin, width - 2 * margin);
          currentParagraph = '';
        }
        drawFormattedText(trimmed.substring(2), margin + BULLET_INDENT, width - 2 * margin - BULLET_INDENT, '•');
      } else if (trimmed.match(/^\d+\.\s/)) {
        if (currentParagraph) {
          drawFormattedText(currentParagraph.trim().replace(/\s+/g, ' '), margin, width - 2 * margin);
          currentParagraph = '';
        }
        const listItemNumber = trimmed.match(/^\d+/)?.[0] || '';
        drawFormattedText(trimmed.replace(/^\d+\.\s/, ''), margin + BULLET_INDENT, width - 2 * margin - BULLET_INDENT, `${listItemNumber}.`);
      } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        if (currentParagraph) {
          drawFormattedText(currentParagraph.trim().replace(/\s+/g, ' '), margin, width - 2 * margin);
          currentParagraph = '';
        }
        drawSubtitle(trimmed.replace(/\*\*/g, ''));
      } else {
        currentParagraph += ` ${trimmed}`;
      }
    }
    
    // Handle any remaining content after the loop.
    if (isInsideTable) {
      drawTable(tableBuffer.join('\n'));
    }
    if (currentParagraph) {
      drawFormattedText(currentParagraph.trim().replace(/\s+/g, ' '), margin, width - 2 * margin);
    }
  };

  // Draw the main report title.
  drawTitle("Research Report");
  y -= 20;

  // Draw the Summary section if it exists.
  if (researchQuery.summary) {
    drawSubtitle("Summary");
    parseAndDrawContent(researchQuery.summary);
    y -= 20;
  }

  // Draw the Table section if it exists.
  if (researchQuery.table) {
    drawSubtitle("Table");
    drawTable(researchQuery.table);
    y -= 20;
  }

  // Draw the Gaps and Limitations section if it exists.
  if (researchQuery.gaps) {
    drawSubtitle("Gaps and Limitations");
    parseAndDrawContent(researchQuery.gaps);
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}