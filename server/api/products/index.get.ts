export default defineEventHandler(async (event) => {
  const { q, sort, order } = getQuery(event) as {
    q?: string;
    sort?: "name" | "price";
    order?: "asc" | "desc";
  };

  await new Promise(function (resolve) {
    setTimeout(resolve, 500);
  });

  // Get all products
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
    },
    orderBy: {
      [sort || "name"]: order || "asc",
    },
  });

  return products;
});
