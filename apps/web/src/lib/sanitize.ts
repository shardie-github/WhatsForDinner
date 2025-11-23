/**
 * HTML Sanitization Utilities
 * 
 * Provides safe HTML sanitization for dangerouslySetInnerHTML usage
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param html - Raw HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
  
  // Allow safe HTML tags
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
  ];
  
  // Remove tags not in allowed list (simplified - use DOMPurify in production)
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagPattern, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return '';
  });
  
  return sanitized;
}

/**
 * Sanitize HTML for React dangerouslySetInnerHTML
 * 
 * @param html - Raw HTML string
 * @returns Object with __html property for dangerouslySetInnerHTML
 */
export function sanitizeForReact(html: string): { __html: string } {
  return {
    __html: sanitizeHTML(html),
  };
}

/**
 * Check if HTML content is safe
 * 
 * @param html - HTML string to check
 * @returns true if HTML appears safe
 */
export function isHTMLSafe(html: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(html));
}
