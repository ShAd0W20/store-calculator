import { getServerSession } from "#auth";
import { paramWithId } from "~/server/utils/schemas/paramWithId";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    throw createError({
      message: "You must be logged in to get work time",
      status: 401,
    });
  }

  const { id } = await getValidatedRouterParams(event, (query) =>
    paramWithId.parseAsync(query)
  );

  if (id !== session.user.id && session.user.role !== "admin") {
    throw createError({
      message: "You can only get your own work time",
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

  const totalWorkTime = await prisma.$queryRaw`
    SELECT TO_CHAR(
        SUM(tw.end - tw.start), 
        'HH24:MI:SS'
    ) AS total_work_time
    FROM public."TimeWork" tw
    WHERE tw."userId" = ${userExists.id}
    AND tw.end IS NOT NULL
  `;

  return totalWorkTime[0].total_work_time;
});
