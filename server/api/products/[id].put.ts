import { getServerSession } from "#auth";
import {
  updateProductSchema,
  productIdSchema,
} from "~/server/utils/schemas/productSchema";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    return { status: 401, data: { message: "Unauthorized" } };
  }

  if (session.user.role !== "admin") {
    return { status: 403, data: { message: "Forbidden" } };
  }

  const query = await getValidatedRouterParams(event, (query) =>
    productIdSchema.safeParse(query)
  );

  if (!query.success) {
    throw createError({
      statusCode: 422,
      statusText: "Unprocessable Entity",
      statusMessage: query.error.errors
        .map((error) => error.message)
        .join(", "),
    });
  }
  const result = await readValidatedBody(event, (body) =>
    updateProductSchema.safeParse(body)
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

  // Get the product
  const product = await prisma.product.findUnique({
    where: {
      id: query.data.id,
    },
  });

  if (!product) {
    throw createError({
      statusCode: 404,
      statusText: "Not Found",
      statusMessage: "Product not found",
    });
  }

  // Create a new product
  const updatedProduct = await prisma.product.update({
    where: {
      id: product.id,
    },
    data: {
      ...result.data,
    },
  });

  setResponseStatus(event, 200);
  return {
    status: 200,
    data: updatedProduct,
  };
});
