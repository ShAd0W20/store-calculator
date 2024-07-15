export default defineEventHandler(async (event) => {
  const config = await prisma.appConfig.findFirst();

  if (!config) {
    throw createError({
      message: "Config not found",
      statusCode: 404,
    });
  }

  return {
    config,
  };
});
