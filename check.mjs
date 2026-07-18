import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  const products = await p.product.findMany({
    include: { variants: true },
    orderBy: { id: "asc" },
  });
  for (const prod of products) {
    console.log(`#${prod.id} ${prod.name}`);
    console.log(`  product: color="${prod.color}" size="${prod.size}" price=${prod.price} stock=${prod.stock}`);
    console.log(`  variants (${prod.variants.length}):`);
    for (const v of prod.variants) {
      console.log(`    id:${v.id} size="${v.size}" color="${v.color}" price=${v.price} stock=${v.stock}`);
    }
  }
} catch(e) {
  console.error(e);
} finally {
  await p.$disconnect();
}
