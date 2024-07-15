import { getServerSession } from "#auth";
import { craeteClientSchema } from "~/server/utils/schemas/clientSchema";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    return { status: 401, data: { message: "Unauthorized" } };
  }

  const result = await readValidatedBody(event, (body) =>
    craeteClientSchema.safeParse(body)
  );

  if (!result.success) {
    throw createError({
      statusCode: 422,
      statusText: "Unprocessable Entity",
      statusMessage: result.error.errors
        .map((error) => error.message)
        .join(", "),
    });
  }

  // Create a new product
  const product = await prisma.client.create({
    data: {
      ...result.data,
    },
  });

  setResponseStatus(event, 201);
  return {
    status: 201,
    data: product,
  };
});
