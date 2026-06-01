/**
 * Generate a slug from a string
 * @param {string} text 
 * @returns {string}
 */
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = {
  generateSlug
};
