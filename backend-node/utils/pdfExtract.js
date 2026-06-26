const fs = require('fs');
const logger = require('./logger');

async function extractText(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    logger.warn('PDF text extraction failed', { filePath, err: err.message });
    return '';
  }
}

module.exports = { extractText };
