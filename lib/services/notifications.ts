import { prisma } from "@/lib/prisma";

export const createNotification = async ({
  userId,
  title,
  message,
  orderId,
}: {
  userId: string;
  title: string;
  message: string;
  orderId?: string;
}) =>
  prisma.notification.create({
    data: { userId, title, message, orderId },
  });

export const getMyNotifications = (userId: string) =>
  prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

export const markAsRead = (id: string, userId: string) =>
  prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });

export const markAllAsRead = (userId: string) =>
  prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

export const getUnreadCount = (userId: string) =>
  prisma.notification.count({
    where: { userId, read: false },
  });
