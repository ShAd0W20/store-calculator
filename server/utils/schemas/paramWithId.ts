import { z } from "zod";

export const paramWithId = z.object({
  id: z.string().cuid(),
});
