import { getServerSession } from "#auth";
import { orderSchema } from "~/server/utils/schemas/orderSchema";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  if (!session) {
    throw createError({
      message: "You must be logged in to create an order",
      status: 401,
    });
  }

  const body = await readValidatedBody(event, (body) =>
    orderSchema.safeParseAsync(body)
  );

  if (!body.success) {
    throw createError({
      message: body.error.message,
      status: 422,
    });
  }

  await prisma.$transaction(async (prisma) => {
    // Step 1: Create the order with items
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        clientId: body.data.clientId,
        total: 0, // Temporary total, will update later
        items: {
          createMany: {
            data: body.data.products.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price * item.quantity,
            })),
          },
        },
      },
      include: {
        items: true, // Include items to calculate total
      },
    });

    // Step 2: Calculate the total
    const total = order.items.reduce((sum, item) => sum + item.price, 0);

    // Step 3: Update the order with the correct total
    await prisma.order.update({
      where: { id: order.id },
      data: { total },
    });

    return order;
  });

  setResponseStatus(event, 201);
});
