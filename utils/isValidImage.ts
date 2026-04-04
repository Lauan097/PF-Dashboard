export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(new URL(url).pathname);
  } catch { return false; }
}