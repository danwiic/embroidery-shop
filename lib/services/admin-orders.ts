import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/lib/types";
import { getPaginationParams, paginate, prismaPagination, type PaginationParams } from "./pagination";

export const getAllOrders = (params: {
  status?: OrderStatus;
  q?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}) => {
  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.q?.trim()) {
    where.OR = [
      { orderNumber: { contains: params.q.trim(), mode: "insensitive" } },
      { user: { name: { contains: params.q.trim(), mode: "insensitive" } } },
    ];
  }
  if (params.dateFrom || params.dateTo) {
    where.createdAt = {};
    if (params.dateFrom) where.createdAt.gte = params.dateFrom;
    if (params.dateTo) where.createdAt.lte = params.dateTo;
  }
  const pagination: PaginationParams = getPaginationParams(
    new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 20) }),
    { page: params.page ?? 1, limit: params.limit ?? 20 },
  );

  return Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
        category: true,
        statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      ...prismaPagination(pagination),
    }),
    prisma.order.count({ where }),
  ]).then(([data, total]) => paginate(data, total, pagination));
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
