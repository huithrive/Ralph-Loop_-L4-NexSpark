/**
 * Research input validator
 */

/**
 * Validate research inputs
 * @param {object} data - { website_url, product_description }
 * @returns {{ valid: boolean, errors: object[] }}
 */
function validateResearchInput(data) {
  const errors = [];

  // Validate website_url
  if (!data || !data.website_url) {
    errors.push({ field: 'website_url', message: 'website_url is required' });
  } else if (typeof data.website_url !== 'string') {
    errors.push({ field: 'website_url', message: 'website_url must be a string' });
  } else {
    try {
      const url = new URL(data.website_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push({ field: 'website_url', message: 'website_url must use http or https protocol' });
      }
    } catch (e) {
      errors.push({ field: 'website_url', message: 'website_url must be a valid URL (e.g. https://example.com)' });
    }
  }

  // Validate product_description
  if (!data || !data.product_description) {
    errors.push({ field: 'product_description', message: 'product_description is required' });
  } else if (typeof data.product_description !== 'string') {
    errors.push({ field: 'product_description', message: 'product_description must be a string' });
  } else if (data.product_description.length < 10) {
    errors.push({ field: 'product_description', message: 'product_description must be at least 10 characters' });
  } else if (data.product_description.length > 5000) {
    errors.push({ field: 'product_description', message: 'product_description must be at most 5000 characters' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = { validateResearchInput };
