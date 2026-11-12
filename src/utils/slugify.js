function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}_-]+/gu, '-') // Preserve Unicode letters/marks (e.g. Malayalam) & digits
    .replace(/-+/g, '-')                      // Collapse multiple dashes
    .replace(/^-+|-+$/g, '');                 // Trim leading/trailing dashes
}

module.exports = { slugify };
