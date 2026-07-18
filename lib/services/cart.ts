import { prisma } from "@/lib/prisma";

const variantInclude = {
  select: { id: true, size: true, color: true, price: true, stock: true, imageUrl: true, sku: true },
};

const getStock = async (productId: number, variantId?: number) => {
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { stock: true } });
    return variant?.stock ?? 0;
  }
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true } });
  return product?.stock ?? 0;
};

export const getCart = (userId: string) =>
  prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { category: true } }, variant: variantInclude },
        orderBy: { createdAt: "asc" },
      },
    },
  });

export const addToCart = async ({
  userId,
  productId,
  quantity,
  color,
  size,
  variantId,
}: {
  userId: string;
  productId: number;
  quantity: number;
  color?: string;
  size?: string;
  variantId?: number;
}) => {
  const available = await getStock(productId, variantId);
  if (quantity > available) {
    throw new Error(`Only ${available} item(s) available.`);
  }

  const cart =
    (await prisma.cart.findUnique({ where: { userId } })) ??
    (await prisma.cart.create({ data: { userId } }));

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId ?? null,
      color: color ?? null,
      size: size ?? null,
    },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > available) {
      throw new Error(`Only ${available} item(s) available (you already have ${existing.quantity} in cart).`);
    }
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
      include: { product: { include: { category: true } }, variant: variantInclude },
    });
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity, color, size, variantId },
    include: { product: { include: { category: true } }, variant: variantInclude },
  });
};

export const updateCartItem = (id: string, quantity: number) =>
  prisma.cartItem.update({
    where: { id },
    data: { quantity },
    include: { product: { include: { category: true } }, variant: variantInclude },
  });

export const removeCartItem = (id: string) =>
  prisma.cartItem.delete({ where: { id } });

export const clearCart = (userId: string) =>
  prisma.cartItem.deleteMany({
    where: { cart: { userId } },
  });
