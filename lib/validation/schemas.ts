import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  phone: z.string().max(20).nullable().optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  categoryId: z.number().int().positive(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0).optional(),
  color: z.string().max(50).optional(),
  size: z.string().max(20).optional(),
  imageUrl: z.string().url().optional().nullable(),
  variants: z
    .array(
      z.object({
        size: z.string().max(20).optional(),
        color: z.string().max(50).optional(),
        price: z.number().positive().optional(),
        stock: z.number().int().min(0).optional(),
        imageUrl: z.string().optional(),
        sku: z.string().optional(),
      }),
    )
    .optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  sizeGuideUrl: z.string().url().optional().nullable(),
});

export const garmentTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z.string().max(1000).optional(),
});

export const orderCancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const shopSettingsSchema = z.object({
  shopName: z.string().max(200).optional(),
  shopEmail: emailSchema.optional(),
  shopPhone: z.string().max(20).optional(),
  shopAddress: z.string().max(500).optional(),
  businessHours: z.string().max(200).optional(),
  aboutText: z.string().max(2000).optional(),
});

export const stockLogSchema = z.object({
  change: z.number().int().refine((n) => n !== 0, "Change cannot be zero"),
  note: z.string().max(500).optional(),
  variantId: z.number().int().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().max(100).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  colors: z.string().optional(), // comma-separated
  sizes: z.string().optional(), // comma-separated
  sort: z.enum(["name", "price_asc", "price_desc", "newest"]).optional().default("name"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const userRoleSchema = z.object({
  role: z.enum(["ADMIN", "CUSTOMER"]),
});

export const backInStockSchema = z.object({
  email: emailSchema,
});

export const orderCheckoutSchema = z.object({
  fulfillment: z.enum(["PICKUP", "DELIVERY"]),
  deliveryAddress: z.string().max(500).optional(),
  paymentMethod: z.string().min(1),
  paymentRef: z.string().min(1),
});

export const alterationOrderSchema = z.object({
  garmentTypeId: z.number().int().positive(),
  garmentPhotoUrl: z.string().url(),
  fitPreference: z.enum(["SLIM", "REGULAR", "RELAXED", "WIDE"]),
  pickupDate: z.string().min(1),
  serviceFee: z.number().positive(),
  paymentMethod: z.string().min(1),
  paymentRef: z.string().min(1),
  estimatedCompletion: z.string().min(1),
  measurements: z.record(z.string(), z.coerce.number().optional()).optional(),
});
