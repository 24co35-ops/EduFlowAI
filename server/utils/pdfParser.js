const pdfParse = require('pdf-parse');

/**
 * Extract clean plain text from PDF buffer or text input
 */
async function extractTextFromBuffer(buffer, originalFilename = '') {
  if (originalFilename.endsWith('.pdf') || (buffer && buffer.slice(0, 4).toString() === '%PDF')) {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (err) {
      console.warn('[PDF Parser] Failed to parse binary PDF:', err.message);
      return buffer.toString('utf-8');
    }
  }
  return buffer.toString('utf-8');
}

module.exports = { extractTextFromBuffer };
