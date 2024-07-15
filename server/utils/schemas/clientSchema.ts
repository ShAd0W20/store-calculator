import { z } from "zod";

export const craeteClientSchema = z.object({
  name: z
    .string({
      required_error: "Ingrese un nombre",
    })
    .min(3, {
      message: "El nombre debe tener al menos 3 caracteres",
    })
    .regex(/^[a-zA-ZÀ-ÿ0-9_\s]+$/, {
      message: "El nombre solo puede contener letras y números",
    }),
  phone: z
    .string({
      required_error: "Ingrese un teléfono",
    })
    .optional(),
  image: z
    .string()
    .url({
      message: "Ingrese una URL válida",
    })
    .optional(),
});

export const updateClientSchema = z.object({
  name: z
    .string({
      required_error: "Ingrese un nombre",
    })
    .min(3, {
      message: "El nombre debe tener al menos 3 caracteres",
    })
    .regex(/^[a-zA-ZÀ-ÿ0-9_\s]+$/, {
      message: "El nombre solo puede contener letras y números",
    }),
  phone: z
    .string({
      required_error: "Ingrese un teléfono",
    })
    .optional(),
  image: z
    .string()
    .url({
      message: "Ingrese una URL válida",
    })
    .optional(),
});

export const clientIdSchema = z.object({
  id: z
    .string({
      required_error: "Ingrese un ID",
    })
    .cuid({
      message: "ID inválido",
    }),
});
