function validateBlogCategory(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return ['Invalid blog category payload.'];
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Category name is required.');
  }

  if (data.display_order !== undefined && isNaN(parseInt(data.display_order, 10))) {
    errors.push('Display order must be an integer.');
  }

  return errors;
}

function validateBlogArticle(data, isNew = true) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return ['Invalid blog article payload.'];
  }

  if (isNew && (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0)) {
    errors.push('Article title is required.');
  }

  if (isNew && (!data.category_id || isNaN(parseInt(data.category_id, 10)))) {
    errors.push('Valid blog category is required.');
  }

  if (isNew && (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0)) {
    errors.push('Article content is required.');
  }

  if (data.status && !['draft', 'published'].includes(data.status)) {
    errors.push('Status must be either "draft" or "published".');
  }

  return errors;
}

module.exports = {
  validateBlogCategory,
  validateBlogArticle,
};
