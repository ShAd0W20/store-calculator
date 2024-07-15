import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    throw createError({
      message: "You must be logged in to get order",
      status: 401,
    });
  }

  const { id } = await getValidatedRouterParams(event, (query) =>
    paramWithId.parseAsync(query)
  );

  if (id !== session.user.id && session.user.role !== "admin") {
    throw createError({
      message: "You can only get your own orders",
      status: 403,
    });
  }

  const userExists = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!userExists) {
    throw createError({
      message: "User not found",
      status: 404,
    });
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: userExists.id,
    },
    include: {
      items: true,
      client: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
});
