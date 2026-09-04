const pdfParse = require('pdf-parse');

/**
 * Extract clean plain text from PDF buffer or text input
 */
async function extractTextFromBuffer(buffer, originalFilename = '') {
  const isPdf = originalFilename.endsWith('.pdf') || (buffer && buffer.slice(0, 4).toString() === '%PDF');
  if (isPdf) {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (err) {
      console.warn('[PDF Parser] Failed to parse binary PDF:', err.message);
      // ponytail: return empty string instead of raw binary bytes as utf-8
      return '';
    }
  }
  return buffer.toString('utf-8');
}

module.exports = { extractTextFromBuffer };
