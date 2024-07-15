import * as z from "zod";
export const querySchema = z.object({
  q: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
});
