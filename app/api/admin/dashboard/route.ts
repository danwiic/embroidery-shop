import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const GET = async (req: Request) => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "30d";
  const customStart = searchParams.get("start");
  const customEnd = searchParams.get("end");

  const now = new Date();
  let periodStart: Date | undefined;
  let periodEnd: Date | undefined;

  if (customStart && customEnd) {
    periodStart = new Date(customStart);
    periodEnd = new Date(customEnd);
  } else {
    switch (range) {
      case "today":
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "7d":
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "all":
        periodStart = undefined;
        break;
      case "30d":
      default:
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
  }

  const dateFilter = periodStart || periodEnd
    ? { createdAt: { ...(periodStart && { gte: periodStart }), ...(periodEnd && { lte: periodEnd }) } }
    : {};

  const previousPeriodStart = periodStart
    ? new Date(periodStart.getTime() - (periodEnd?.getTime() ?? now.getTime()) + periodStart.getTime())
    : undefined;

  const previousDateFilter = previousPeriodStart && periodStart
    ? { createdAt: { gte: previousPeriodStart, lt: periodStart } }
    : {};

  const LOW_STOCK_THRESHOLD = 5;

  const [currentOrders, previousOrders, totalProducts, recentOrders, lowStockItems] = await Promise.all([
    prisma.order.findMany({
      where: dateFilter,
      select: { id: true, status: true, totalAmount: true },
    }),
    previousPeriodStart
      ? prisma.order.findMany({
          where: previousDateFilter,
          select: { id: true, status: true, totalAmount: true },
        })
      : Promise.resolve([]),
    prisma.product.count(),
    prisma.order.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: { deletedAt: null, stock: { lte: LOW_STOCK_THRESHOLD } },
      select: { id: true, name: true, stock: true, imageUrl: true },
      orderBy: { stock: "asc" },
      take: 5,
    }),
  ]);

  const orderIds = currentOrders.map((o) => o.id);

  const productSales = orderIds.length > 0
    ? await prisma.orderItem.groupBy({
        by: ["productId"],
        where: { orderId: { in: orderIds } },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      })
    : [];

  const currentNonCancelled = currentOrders.filter((o) => o.status !== "CANCELLED");
  const previousNonCancelled = previousOrders.filter((o) => o.status !== "CANCELLED");

  const totalRevenue = currentNonCancelled.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const previousRevenue = previousNonCancelled.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const revenueChange = previousRevenue > 0
    ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)
    : totalRevenue > 0 ? 100 : 0;

  const ordersChange = previousNonCancelled.length > 0
    ? Math.round(((currentNonCancelled.length - previousNonCancelled.length) / previousNonCancelled.length) * 100)
    : currentNonCancelled.length > 0 ? 100 : 0;

  // Orders by status
  const ordersByStatus = currentOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  // Top products
  const productIds = productSales.map((ps) => ps.productId);
  const products = productIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, imageUrl: true },
      })
    : [];
  const topProducts = productSales.map((ps) => {
    const product = products.find((p) => p.id === ps.productId);
    return {
      id: ps.productId,
      name: product?.name ?? "Unknown",
      imageUrl: product?.imageUrl,
      totalSold: ps._sum.quantity ?? 0,
      revenue: Number(ps._sum.price ?? 0),
    };
  });

  return NextResponse.json({
    totalOrders: currentOrders.length,
    totalRevenue,
    pendingOrders: currentOrders.filter((o) => o.status === "PENDING_PAYMENT").length,
    totalProducts,
    revenueChange,
    ordersChange,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      status: o.status,
      serviceType: o.serviceType,
      createdAt: o.createdAt.toISOString(),
      user: { name: o.user.name },
    })),
    lowStockCount: lowStockItems.length,
    lowStockItems,
    ordersByStatus,
    topProducts,
  });
};
