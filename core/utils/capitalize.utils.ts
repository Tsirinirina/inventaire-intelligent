/**
 * Capitalise la première lettre de chaque mot
 * Exemple: "bonjour tout le monde" => "Bonjour Tout Le Monde"
 */
export function capitalizeWords(value: string): string {
  if (!value) return "";

  return value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
