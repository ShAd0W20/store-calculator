import { getServerSession } from "#auth";
import { creteProductSchema } from "~/server/utils/schemas/productSchema";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    return { status: 401, data: { message: "Unauthorized" } };
  }

  if (session.user.role !== "admin") {
    return { status: 403, data: { message: "Forbidden" } };
  }

  const result = await readValidatedBody(event, (body) =>
    creteProductSchema.safeParse(body)
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
  const product = await prisma.product.create({
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
