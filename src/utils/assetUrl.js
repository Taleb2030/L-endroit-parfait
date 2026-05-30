/** Resolve public asset paths for GitHub Pages (/restaurant-lendroit-parfait/) and local dev */
export function assetUrl(path) {
  const clean = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${clean}`
}
