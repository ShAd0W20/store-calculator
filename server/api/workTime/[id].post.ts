import { getServerSession } from "#auth";
import { paramWithId } from "~/server/utils/schemas/paramWithId";
import { getWorkTimeSchema } from "~/server/utils/schemas/workTimeSchemas";

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

  const { start, end } = await readValidatedBody(event, (body) =>
    getWorkTimeSchema.parseAsync(body)
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
    SELECT
    DATE(tw.start) AS work_date,
     TO_CHAR(
        SUM(tw.end - tw.start), 
        'HH24:MI:SS'
    ) AS total_work_time,
	  EXTRACT(EPOCH FROM SUM(tw.end - tw.start)) AS total_work_time_seconds
    FROM public."TimeWork" tw
    WHERE tw."userId" = ${userExists.id}
    AND tw.end IS NOT NULL
    AND tw.start BETWEEN TO_TIMESTAMP(${start}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AND TO_TIMESTAMP(${end}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    GROUP BY DATE(tw.start)
    ORDER BY work_date;
  `;

  return totalWorkTime;
});
