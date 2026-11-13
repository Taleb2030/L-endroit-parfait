/** Resolve public asset paths for GitHub Pages (/L-endroit-parfait/) and local dev */
export function assetUrl(path) {
  const clean = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${clean}`
}
