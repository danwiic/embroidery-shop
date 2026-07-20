import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/lib/types";

export const getAllOrders = (status?: OrderStatus, dateFrom?: Date, dateTo?: Date) => {
  const where: any = {};
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }
  return prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      category: true,
      statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAdminOrder = (id: string) =>
  prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: { include: { product: true } },
      category: true,
      measurements: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

export const updateOrderStatus = (
  id: string,
  status: OrderStatus,
  changedBy: string,
  note?: string,
) =>
  prisma.order.update({
    where: { id },
    data: {
      status,
      statusHistory: {
        create: { status, changedBy, note },
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
