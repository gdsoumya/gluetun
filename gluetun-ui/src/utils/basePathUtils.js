/**
 * Utility to handle dynamic base path at runtime
 */

/**
 * Returns the current base path of the application
 * This allows the app to work correctly when deployed under different paths
 * @returns {string} The base path ending with a slash
 */
export function getBasePath() {
  // This gets the base path from the document's base tag if it exists
  const baseTag = document.querySelector("base");
  if (baseTag && baseTag.getAttribute("href")) {
    let basePath = baseTag.getAttribute("href");
    // Ensure the path ends with a slash
    return basePath.replace(/\/$/, '');
  }

  // Fallback: Try to determine from script tags
  const scripts = document.getElementsByTagName("script");
  for (const script of scripts) {
    const src = script.getAttribute("src");
    if (src && src.includes("/assets/")) {
      const basePathMatch = src.match(/(.*?)\/assets\//);
      if (basePathMatch && basePathMatch[1]) {
        const basePath = basePathMatch[1] || "";
        return basePath.replace(/\/$/, '');
      }
    }
  }

  // Default to root if we can't determine
  return "/";
}

/**
 * Prepends the base path to a URL path
 * @param {string} path - The path to prepend the base path to
 * @returns {string} The complete URL path
 */
export function withBasePath(path) {
  const basePath = getBasePath();
  // Remove leading slash from path if it exists and base path already has trailing slash
  const normalizedPath = path.startsWith("/") ? path.substring(1) : path;
  return `${basePath}${normalizedPath}`;
}
