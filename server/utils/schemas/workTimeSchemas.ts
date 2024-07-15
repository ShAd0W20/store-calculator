import * as z from "zod";

export const workTimeSchema = z.object({
  id: z.string().cuid(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  userId: z.string(),
});

export const getWorkTimeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export type WorkTime = z.infer<typeof workTimeSchema>;
