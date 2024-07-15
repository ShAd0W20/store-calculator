import { getServerSession } from "#auth";
import {
  updateClientSchema,
  clientIdSchema,
} from "~/server/utils/schemas/clientSchema";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    return { status: 401, data: { message: "Unauthorized" } };
  }

  const query = await getValidatedRouterParams(event, (query) =>
    clientIdSchema.safeParse(query)
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
    updateClientSchema.safeParse(body)
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

  // Get the client
  const client = await prisma.client.findUnique({
    where: {
      id: query.data.id,
    },
  });

  if (!client) {
    throw createError({
      statusCode: 404,
      statusText: "Not Found",
      statusMessage: "Client not found",
    });
  }

  // Create a new client
  const updatedClient = await prisma.client.update({
    where: {
      id: client.id,
    },
    data: {
      ...result.data,
    },
  });

  setResponseStatus(event, 200);
  return {
    status: 200,
    data: updatedClient,
  };
});
