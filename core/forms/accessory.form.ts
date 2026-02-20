import { z } from "zod";
export const accessorySchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis"),
  category: z.string().min(1, "Le catégorie est requis"),
  basePrice: z
    .string()
    .min(1, "Prix requis")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Prix invalide"),
  quantity: z
    .string()
    .min(1, "Quantité requise")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Quantité invalide"),
  description: z.string().optional(),
});

export type AccessoryForm = z.infer<typeof accessorySchema>;

export const accessoryFormDefaultValues: AccessoryForm = {
  name: "",
  category: "",
  basePrice: "",
  quantity: "",
  description: "",
};
