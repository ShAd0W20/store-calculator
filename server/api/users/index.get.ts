import { getServerSession } from "#auth";
import { querySchema } from "~/server/utils/schemas/userSchemas";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    setResponseStatus(event, 401);
    return {
      status: 401,
      body: { error: "Unauthorized" },
    };
  }

  if (session.user.role !== "admin") {
    setResponseStatus(event, 403);
    return {
      status: 403,
      body: { error: "Forbidden" },
    };
  }

  const { q, start, end } = await getValidatedQuery(event, (query) =>
    querySchema.parseAsync(query)
  );

  await new Promise(function (resolve) {
    setTimeout(resolve, 500);
  });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          nick: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      nick: true,
      _count: {
        select: {
          Order: {
            where: {
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          }
        },
      },
      TimeWork: {
        select: {
          start: true,
          end: true,
        },
        orderBy: {
          start: "desc",
        },
        take: 1,
      },
    },
  });

  return users.map((user) => ({
    ...user,
    lastConnection: user.TimeWork[0].start,
  }));
});
