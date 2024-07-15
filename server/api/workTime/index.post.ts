import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    throw createError({
      message: "Unauthorized",
      status: 401,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    throw createError({
      message: "User not found",
      status: 404,
    });
  }

  const work = await prisma.timeWork.findFirst({
    where: {
      userId: user.id,
      end: null,
    },
  });

  if (work) {
    await prisma.timeWork.update({
      where: {
        id: work.id,
      },
      data: {
        end: new Date(),
      },
    });

    return {
      status: 200,
      body: {
        message: "Time work ended",
      },
    };
  }

  await prisma.timeWork.create({
    data: {
      userId: user.id,
      start: new Date(),
    },
  });

  return {
    status: 200,
    body: {
      message: "Time work started",
    },
  };
});
