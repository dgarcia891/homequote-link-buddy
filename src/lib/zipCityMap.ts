/**
 * Maps SCV ZIP codes to city names matching the SCV_CITIES constant.
 */
export const ZIP_TO_CITY: Record<string, string> = {
  "91350": "Santa Clarita",
  "91351": "Canyon Country",
  "91354": "Valencia",
  "91355": "Valencia",
  "91380": "Santa Clarita",
  "91381": "Stevenson Ranch",
  "91382": "Santa Clarita",
  "91383": "Santa Clarita",
  "91384": "Santa Clarita",
  "91385": "Santa Clarita",
  "91386": "Canyon Country",
  "91387": "Canyon Country",
  "91390": "Saugus",
  "91321": "Newhall",
  "91322": "Newhall",
};

export function cityFromZip(zip: string): string | null {
  const clean = zip.replace(/\D/g, "").slice(0, 5);
  return ZIP_TO_CITY[clean] || null;
}
