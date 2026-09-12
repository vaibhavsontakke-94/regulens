const NAME_CHUNK = 60; // (reserved for future use)

function extOf(name) {
  const dot = String(name || "").lastIndexOf(".");
  return dot === -1 ? "" : String(name).slice(dot + 1).toLowerCase();
}

function stripHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function looksBinary(text) {
  let bad = 0;
  for (let i = 0; i < text.length && i < 4000; i++) {
    const code = text.charCodeAt(i);
    if (code === 0) return true;
    if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 65533) bad += 1;
  }
  return bad > 100;
}

const BANNED_PDF_TOKENS = new Set([
  "stream", "endstream", "endobj", "obj", "xref", "trailer", "startxref",
  "Type", "PDF", "FlateDecode", "Length", "DecodeParms", "cm", "Td", "Tj",
  "BT", "ET", "TJ", "RG", "rg", "re", "f", "0", "1",
]);

function salvageText(buffer) {
  const words = buffer.toString("latin1").match(/[A-Za-z][A-Za-z0-9'.{}-]{1,}/g) || [];
  const kept = words.filter((w) => w.length > 2 && !BANNED_PDF_TOKENS.has(w)).slice(0, 500).join(" ");
  return kept.length >= 30 ? kept : "";
}

async function extractPdf(buffer) {
  let pdfParse = null;
  try {
    const mod = await import("pdf-parse");
    pdfParse = mod.PDFParse || (mod.default && mod.default.PDFParse) || mod.default || null;
  } catch (err) {
    console.error("[document] pdf-parse v2 import failed:", err && err.message ? err.message : err);
  }
  if (!pdfParse) {
    try {
      const mod = await import("pdf-parse/lib/pdf-parse.js");
      pdfParse = mod.default || mod.PDFParse || mod;
    } catch (err) {
      console.error("[document] pdf-parse v1 import failed:", err && err.message ? err.message : err);
    }
  }
  if (!pdfParse) {
    throw new Error("PDF text extraction is not available on this server.");
  }
  try {
    if (pdfParse.prototype && typeof pdfParse.prototype.getText === "function") {
      const result = await new pdfParse({ data: buffer }).getText();
      const text = String((result && result.text) || "").trim();
      if (text) return text;
    } else {
      const data = await pdfParse(buffer);
      const text = String((data && data.text) || "").trim();
      if (text) return text;
    }
  } catch (err) {
    console.error("[document] pdf-parse failed to parse:", err && err.message ? err.message : err);
  }
  const salvaged = salvageText(buffer);
  if (salvaged) return salvaged;
  throw new Error(
    "no readable text could be extracted from this PDF (it may be scanned, image-only, or encrypted). Save or export it as a text-based PDF, Word (.docx) or .txt file, or paste the text into the chat."
  );
}

async function extractDocx(buffer) {
  let mammoth = null;
  try {
    ({ default: mammoth } = await import("mammoth"));
  } catch {
    throw new Error("Word (.docx) text extraction is not available on this server.");
  }
  const result = await mammoth.extractRawText({ buffer });
  return String(result.value || "").trim();
}

export async function renderPdfPageImages(buffer, maxPages = 3) {
  let pdfParse = null;
  try {
    const mod = await import("pdf-parse");
    pdfParse = mod.PDFParse || (mod.default && mod.default.PDFParse);
  } catch (err) {
    console.error("[document] pdf-parse unavailable for page rendering:", err && err.message ? err.message : err);
    return [];
  }
  if (!pdfParse) return [];
  try {
    const shot = await new pdfParse({ data: buffer }).getScreenshot();
    const pages = (shot && shot.pages) || [];
    const images = [];
    for (const page of pages.slice(0, maxPages)) {
      if (page && page.dataUrl) images.push(page.dataUrl);
      else if (page && page.data && page.data.length) images.push(`data:image/png;base64,${page.data.toString("base64")}`);
    }
    return images;
  } catch (err) {
    console.error("[document] pdf page render failed:", err && err.message ? err.message : err);
    return [];
  }
}

export async function extractDocumentText(name, buffer) {
  const ext = extOf(name);

  if (ext === "pdf") return extractPdf(buffer);

  if (ext === "docx") {
    const text = await extractDocx(buffer);
    if (text) return text;
    throw new Error("No readable text was found inside the .docx file.");
  }

  if (ext === "txt" || ext === "md" || ext === "csv" || ext === "json" || ext === "log" || ext === "rtf") {
    return buffer.toString("utf8").trim();
  }

  if (ext === "html" || ext === "htm") {
    return stripHtml(buffer.toString("utf8"));
  }

  const fallback = buffer.toString("utf8").trim();
  if (fallback && !looksBinary(fallback)) return fallback;

  throw new Error(
    `Unsupported or unreadable document type (.${ext || "unknown"}). Supported types: PDF, Word (.docx), TXT, Markdown, CSV, JSON, HTML, RTF. For images, extract the text to a PDF or TXT file first.`
  );
}