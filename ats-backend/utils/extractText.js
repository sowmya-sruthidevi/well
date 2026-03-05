const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");

async function extractText(file) {
  if (!file) throw new Error("No file provided");

  // PDF
  if (file.mimetype === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  // DOCX
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  // IMAGE (PNG/JPG)
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg"
  ) {
    const {
      data: { text },
    } = await Tesseract.recognize(file.buffer, "eng");

    return text;
  }

  throw new Error("Unsupported file type");
}

module.exports = extractText;