import * as z from "zod";

export const orderSchema = z.object({
  clientId: z.string().cuid(),
  products: z.array(
    z.object({
      product: z.object({
        id: z.string().cuid(),
        name: z.string(),
        description: z.string().optional().nullable(),
        price: z.number(),
        image: z.string().optional().nullable(),
      }),
      quantity: z
        .number({
          message: "Quantity is required",
        })
        .min(1, { message: "Quantity must be greater than 0" })
        .max(100, { message: "Quantity must be less than 100" }),
    })
  ),
});
