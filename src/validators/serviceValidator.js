function isValidHttpUrl(string) {
  if (!string || string.trim() === '') return true; // empty/null allowed as unconfigured placeholder
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function validateCategory(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return ['Invalid category payload.'];
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Category name is required.');
  }

  if (data.display_order !== undefined && isNaN(parseInt(data.display_order, 10))) {
    errors.push('Display order must be an integer.');
  }

  return errors;
}

function validateServiceLink(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return ['Invalid service link payload.'];
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Service name is required.');
  }

  if (!data.category_id || isNaN(parseInt(data.category_id, 10))) {
    errors.push('Valid category ID is required.');
  }

  if (data.destination_url && !isValidHttpUrl(data.destination_url)) {
    errors.push('Destination URL must be a valid HTTP or HTTPS address, or empty for unconfigured placeholder.');
  }

  if (data.display_order !== undefined && isNaN(parseInt(data.display_order, 10))) {
    errors.push('Display order must be an integer.');
  }

  return errors;
}

module.exports = {
  isValidHttpUrl,
  validateCategory,
  validateServiceLink,
};
