import fs from 'fs';
import path from 'path';

// Extracts plain text from an uploaded resume file for automatic ATS
// scoring. Only PDF is actually parsed (pdf-parse is pure-JS and reliable);
// .doc/.docx binary formats are not parsed here, so callers get `null` and
// should surface a "scoring unavailable for this file type" message rather
// than fabricate a score from a file we never actually read.
export async function extractResumeText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.pdf') return null;

  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const result = await pdfParse(buffer);
    return (result.text || '').trim() || null;
  } catch (err) {
    console.error('PDF text extraction failed:', err.message);
    return null;
  }
}
