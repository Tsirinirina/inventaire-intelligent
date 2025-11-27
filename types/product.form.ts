import { z } from "zod";
export const productSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis"),
  brand: z.string().min(1, "La marque est requise"),
  category: z.string().min(1, "La catégorie est requise"),
  price: z
    .string()
    .min(1, "Prix requis")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Prix invalide"),
  quantity: z
    .string()
    .min(1, "Quantité requise")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Quantité invalide"),
  description: z.string().optional(),
});

export type ProductForm = z.infer<typeof productSchema>;

export const productFormDefaultValues: ProductForm = {
  name: "",
  brand: "",
  category: "",
  price: "",
  quantity: "",
  description: "",
};
