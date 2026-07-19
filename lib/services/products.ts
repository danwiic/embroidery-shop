import { prisma } from "@/lib/prisma";

// ── Categories ──

export const getCategories = () =>
  prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });

export const getCategoriesWithProducts = async () => {
  const cats = await prisma.category.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { products: { where: { deletedAt: null } } } },
      products: {
        where: { deletedAt: null },
        take: 1,
        orderBy: { name: "asc" },
        select: { imageUrl: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return cats
    .filter((c) => c._count.products > 0)
    .map((c) => ({ ...c, productImageUrl: c.products[0]?.imageUrl ?? null }));
};

export const createCategory = (data: { name: string; slug: string; sizeGuideUrl?: string }) =>
  prisma.category.create({ data });

export const updateCategory = (id: number, data: { name?: string; slug?: string; sizeGuideUrl?: string }) =>
  prisma.category.update({ where: { id }, data });

export const deleteCategory = async (id: number) => {
  const products = await prisma.product.count({ where: { categoryId: id, deletedAt: null } });
  if (products > 0) {
    throw new Error("Cannot delete category with existing products");
  }
  return prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
};

// ── Products ──

export const getProducts = (categoryId?: number, take?: number) =>
  prisma.product.findMany({
    where: { deletedAt: null, ...(categoryId ? { categoryId } : {}) },
    include: { category: true, images: { orderBy: { order: "asc" } }, variants: true },
    orderBy: { name: "asc" },
    take,
  });

export const getProduct = (id: number) =>
  prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: { category: true, images: { orderBy: { order: "asc" } }, variants: true },
  });

export const createProduct = (data: {
  name: string;
  description?: string;
  categoryId: number;
  price: number;
  stock?: number;
  color?: string;
  size?: string;
  imageUrl?: string;
  images?: { url: string; order?: number }[];
  variants?: { size?: string; color?: string; price?: number; stock?: number; imageUrl?: string; sku?: string }[];
}) =>
  prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      price: data.price,
      stock: data.stock ?? 0,
      color: data.color,
      size: data.size,
      imageUrl: data.imageUrl,
      images: data.images ? { create: data.images } : undefined,
      variants: data.variants ? { create: data.variants } : undefined,
    },
    include: { category: true, images: { orderBy: { order: "asc" } }, variants: true },
  });

export const updateProduct = (
  id: number,
  data: Partial<{
    name: string;
    description: string;
    categoryId: number;
    price: number;
    stock: number;
    color: string;
    size: string;
    imageUrl: string;
    variants?: { size?: string; color?: string; price?: number; stock?: number; imageUrl?: string; sku?: string }[];
  }>,
) =>
  prisma.$transaction(async (tx) => {
    const { variants, ...fields } = data;
    if (variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        await tx.productVariant.createMany({ data: variants.map((v) => ({ ...v, productId: id })) });
      }
    }
    return tx.product.update({
      where: { id },
      data: fields,
      include: { category: true, images: { orderBy: { order: "asc" } }, variants: true },
    });
  });

export const deleteProduct = (id: number) =>
  prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });

// ── Variants ──

export const getVariants = (productId: number) =>
  prisma.productVariant.findMany({
    where: { productId },
    orderBy: [{ color: "asc" }, { size: "asc" }],
  });

export const createVariant = (data: {
  productId: number;
  size?: string;
  color?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  sku?: string;
}) =>
  prisma.productVariant.create({ data });

export const updateVariant = (
  id: number,
  data: Partial<{ size: string; color: string; price: number; stock: number; imageUrl: string; sku: string }>,
) =>
  prisma.productVariant.update({ where: { id }, data });

export const deleteVariant = (id: number) =>
  prisma.productVariant.delete({ where: { id } });

// ── Product Images ──

export const getProductImages = (productId: number) =>
  prisma.productImage.findMany({
    where: { productId },
    orderBy: { order: "asc" },
  });

export const addProductImage = (productId: number, url: string, order?: number) =>
  prisma.productImage.create({
    data: { productId, url, order: order ?? 0 },
  });

export const deleteProductImage = (id: number) =>
  prisma.productImage.delete({ where: { id } });

// ── Stock Log ──

export const getStockLogs = (productId: number, variantId?: number) =>
  prisma.stockLog.findMany({
    where: { productId, variantId: variantId ?? undefined },
    orderBy: { createdAt: "desc" },
  });

export const getAllStockLogs = (limit = 50) =>
  prisma.stockLog.findMany({
    include: { product: { select: { id: true, name: true } }, variant: { select: { id: true, size: true, color: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

export const addStockLog = (
  productId: number,
  change: number,
  note?: string,
  variantId?: number,
) =>
  prisma.$transaction(async (tx) => {
    let product;
    if (variantId) {
      await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: { increment: change } },
      });
      product = await tx.product.findUnique({ where: { id: productId } });
    } else {
      product = await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: change } },
      });
    }
    const log = await tx.stockLog.create({
      data: { productId, variantId, change, note },
    });
    return { product, log };
  });
