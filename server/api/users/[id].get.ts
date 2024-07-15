import { getServerSession } from "#auth";
import { paramWithId } from "~/server/utils/schemas/paramWithId";

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

  const { id } = await getValidatedRouterParams(event, (query) =>
    paramWithId.parseAsync(query)
  );

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    setResponseStatus(event, 404);
    return {
      status: 404,
      body: { error: "User not found" },
    };
  }

  return user;
});
