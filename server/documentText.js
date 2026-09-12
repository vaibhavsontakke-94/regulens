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
      return String((result && result.text) || "").trim();
    }
    const data = await pdfParse(buffer);
    return String((data && data.text) || "").trim();
  } catch (err) {
    throw new Error(
      `The PDF could not be read (${err && err.message ? err.message : "parsing failed"}). If the file is a scanned image, extract the text to a TXT or DOCX file first.`
    );
  }
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