export const COUNTRY_ALIASES: Record<string, string> = {
  england: "United Kingdom",
  "great britain": "United Kingdom",
  "united kingdom": "United Kingdom",
  uk: "United Kingdom",
  "united arab emirates": "UAE",
  uae: "UAE",
  balkan: "Balkans",
  balkans: "Balkans",
  kazakstan: "Kazakhstan",
  kazakhstan: "Kazakhstan",
};

export function normalizeCountry(rawCountry: string | null | undefined): string | null {
  if (!rawCountry) {
    return null;
  }

  const trimmed = rawCountry.trim();
  if (!trimmed) {
    return null;
  }

  const alias = COUNTRY_ALIASES[trimmed.toLowerCase()];
  return alias || trimmed;
}

export function getGeoCountryName(feature: {
  properties?: Record<string, unknown>;
} | null | undefined): string | null {
  if (!feature?.properties) {
    return null;
  }

  const raw =
    (feature.properties.name as string | undefined) ||
    (feature.properties.ADMIN as string | undefined) ||
    (feature.properties.NAME as string | undefined) ||
    null;

  if (!raw) {
    return null;
  }

  return raw.trim() || null;
}

export function displayCountryName(country: string | null | undefined): string {
  return normalizeCountry(country) || "Unknown";
}
