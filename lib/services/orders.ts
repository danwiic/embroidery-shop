import { prisma } from "@/lib/prisma";
import { clearCart } from "./cart";

type CreateReadyMadeOrderParams = {
  userId: string;
  fulfillment: "PICKUP" | "DELIVERY";
  deliveryAddress?: string;
  paymentMethod: string;
  paymentRef: string;
};

type CreateAlterationOrderParams = {
  userId: string;
  garmentTypeId: number;
  garmentPhotoUrl: string;
  fitPreference: "SLIM" | "REGULAR" | "RELAXED" | "WIDE";
  pickupDate: string;
  serviceFee: number;
  paymentMethod: string;
  paymentRef: string;
  estimatedCompletion: string;
  measurements: {
    waist?: number;
    hip?: number;
    thighWidth?: number;
    inseam?: number;
    length?: number;
    legOpening?: number;
    shoulder?: number;
    chest?: number;
    sleeveLength?: number;
    shirtLength?: number;
    pantsWaist?: number;
    pantsLength?: number;
  };
};

export const createReadyMadeOrder = async (params: CreateReadyMadeOrderParams) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: params.userId },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const order = await prisma.order.create({
    data: {
      userId: params.userId,
      serviceType: "READY_MADE",
      fulfillment: params.fulfillment,
      deliveryAddress: params.deliveryAddress,
      paymentMethod: params.paymentMethod,
      paymentRef: params.paymentRef,
      totalAmount,
      status: "PENDING_PAYMENT",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.variant?.price ?? item.product.price,
        })),
      },
      statusHistory: {
        create: { status: "PENDING_PAYMENT", note: "Order created" },
      },
    },
    include: {
      items: { include: { product: true } },
      statusHistory: true,
    },
  });

  await clearCart(params.userId);
  return order;
};

export const createAlterationOrder = async (params: CreateAlterationOrderParams) => {
  const order = await prisma.order.create({
    data: {
      userId: params.userId,
      serviceType: "ALTERATION",
      garmentTypeId: params.garmentTypeId,
      garmentPhotoUrl: params.garmentPhotoUrl,
      fitPreference: params.fitPreference,
      pickupDate: new Date(params.pickupDate),
      serviceFee: params.serviceFee,
      totalAmount: params.serviceFee,
      paymentMethod: params.paymentMethod,
      paymentRef: params.paymentRef,
      estimatedCompletion: new Date(params.estimatedCompletion),
      status: "PENDING_PAYMENT",
      measurements: {
        create: params.measurements,
      },
      statusHistory: {
        create: { status: "PENDING_PAYMENT", note: "Alteration order created" },
      },
    },
    include: {
      garmentType: true,
      measurements: true,
      statusHistory: true,
    },
  });

  return order;
};

export const getMyOrders = (userId: string) =>
  prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true, variant: true } },
      garmentType: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

export const getOrder = (id: string, userId?: string) =>
  prisma.order.findFirst({
    where: userId ? { id, userId } : { id },
    include: {
      items: { include: { product: true, variant: true } },
      garmentType: true,
      measurements: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
