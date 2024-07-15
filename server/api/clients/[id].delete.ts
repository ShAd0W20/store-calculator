import { getServerSession } from "#auth";
import { clientIdSchema } from "~/server/utils/schemas/clientSchema";

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, (query) =>
    clientIdSchema.parseAsync(query)
  );

  const session = await getServerSession(event);

  if (!session) {
    return { status: 401, data: { message: "Unauthorized" } };
  }

  if (session.user.role !== "admin") {
    return { status: 403, data: { message: "Forbidden" } };
  }

  const client = await prisma.client.findUnique({
    where: {
      id,
    },
  });

  if (!client) {
    throw createError({
      statusCode: 404,
      statusText: "Not Found",
      statusMessage: "Client not found",
    });
  }

  await prisma.order.deleteMany({
    where: {
      clientId: client.id,
    },
  });

  // Delete a product
  await prisma.client.delete({
    where: {
      id: client.id,
    },
  });

  setResponseStatus(event, 204);
});
