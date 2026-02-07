export const formatAriaryBasic = (amount: number) => {
  return `${amount.toLocaleString("fr-MG")} Ar`;
};

export const formatAriary = (amount: number) => {
  // Formater le nombre avec séparateurs de milliers
  const numberWithSeparators = new Intl.NumberFormat("fr-MG", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // Remplacer les espaces par des points
  const numberWithDots = numberWithSeparators.replace(/\s/g, ".");

  // Ajouter la devise
  return `${numberWithDots} Ar`;
};
