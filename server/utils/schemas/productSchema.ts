import { z } from "zod";

export const creteProductSchema = z.object({
  name: z
    .string({
      required_error: "Ingrese un nombre",
    })
    .min(3, {
      message: "El nombre debe tener al menos 3 caracteres",
    })
    .regex(/[\w\s]+/, {
      message: "El nombre solo puede contener letras y numeros",
    }),
  description: z.string().optional(),
  price: z.number({
    required_error: "Ingrese un precio",
  }),
  image: z
    .string()
    .url({
      message: "Ingrese una URL válida",
    })
    .optional(),
});

export const updateProductSchema = z.object({
  name: z
    .string({
      required_error: "Ingrese un nombre",
    })
    .min(3, {
      message: "El nombre debe tener al menos 3 caracteres",
    })
    .regex(/[\w\s]+/, {
      message: "El nombre solo puede contener letras y numeros",
    })
    .optional(),
  description: z.string().optional(),
  price: z.number({
    required_error: "Ingrese un precio",
  }),
  image: z
    .string()
    .url({
      message: "Ingrese una URL válida",
    })
    .optional(),
});

export const productIdSchema = z.object({
  id: z.string({
    required_error: "Ingrese un ID",
  }).cuid({
    message: "ID inválido",
  }),
});
