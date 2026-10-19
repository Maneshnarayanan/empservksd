function validateDownload(data, isNew = true) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return ['Invalid download payload.'];
  }

  if (isNew && (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0)) {
    errors.push('Download title is required.');
  }

  if (data.title && (typeof data.title !== 'string' || data.title.trim().length > 255)) {
    errors.push('Title must be at most 255 characters.');
  }

  return errors;
}

module.exports = { validateDownload };
