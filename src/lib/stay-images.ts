import photos from "./stay-photos.json" with { type: "json" };

// Keep matching independent of daily price rows and cosmetic name changes.
const propertyKey = (name: string) => name.normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\(adults only\)/gi, "")
  .toLowerCase().replace(/[^a-z0-9]/g, "");

const localPhotos = new Map(photos.map((photo) => [propertyKey(photo.property), photo.src]));

export function stayImage(property: string, source: string): string {
  const local = localPhotos.get(propertyKey(property));
  if (local) return local;
  // Future properties can still use their source photo. Preserve the entire URL:
  // Booking's CDN rejects image URLs when their required query string is removed.
  try {
    const url = new URL(source.trim());
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}
