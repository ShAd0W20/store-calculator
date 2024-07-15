import { getServerSession } from "#auth";
import { productIdSchema } from "~/server/utils/schemas/productSchema";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, (query) =>
    productIdSchema.parseAsync(query)
  );

  const session = await getServerSession(event);

  if (!session) {
    return { status: 401, data: { message: "Unauthorized" } };
  }

  if (session.user.role !== "admin") {
    return { status: 403, data: { message: "Forbidden" } };
  }

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw createError({
      statusCode: 404,
      statusText: "Not Found",
      statusMessage: "Product not found",
    });
  }

  // Delete a product
  await prisma.product.delete({
    where: {
      id: product.id,
    },
  });

  setResponseStatus(event, 204);
});
