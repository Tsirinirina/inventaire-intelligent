export const formatAriaryBasic = (amount: number) => {
  return `${amount.toLocaleString("fr-MG")} Ar`;
};

export const formatAriary = (amount: number) => {
  return new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("MGA", "Ar")
    .replace(" ", ".");
};
