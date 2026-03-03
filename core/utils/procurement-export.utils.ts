import { ProcurementItem } from "@/core/store/procurement.store";
import { formatAriary } from "./currency.utils";
import { formatDate } from "./date.utils";
import { capitalizeWords } from "./capitalize.utils";

export function formatProcurementListAsText(
  items: ProcurementItem[],
): string {
  const now = new Date();
  const dateStr = formatDate(now.toISOString());

  let text = `=== LISTE D'APPROVISIONNEMENT ===\n`;
  text += `Date : ${dateStr}\n\n`;

  items.forEach((item, index) => {
    text += `${index + 1}. ${item.name}`;
    if (item.brand) text += ` (${item.brand})`;
    text += `\n`;
    text += `   Catégorie : ${capitalizeWords(item.category)}\n`;
    text += `   Stock actuel : ${item.currentStock} | Quantité à commander : ${item.quantityToOrder}\n`;
    if (item.estimatedUnitCost) {
      text += `   Coût estimé : ${formatAriary(item.estimatedUnitCost * item.quantityToOrder)}\n`;
    }
    if (item.notes) {
      text += `   Note : ${item.notes}\n`;
    }
    text += `\n`;
  });

  text += `---\n`;
  text += `Total articles : ${items.length}\n`;

  const totalQty = items.reduce((s, i) => s + i.quantityToOrder, 0);
  text += `Total quantité : ${totalQty}\n`;

  const totalCost = items.reduce(
    (s, i) => s + (i.estimatedUnitCost ?? 0) * i.quantityToOrder,
    0,
  );
  if (totalCost > 0) {
    text += `Coût total estimé : ${formatAriary(totalCost)}\n`;
  }

  return text;
}
