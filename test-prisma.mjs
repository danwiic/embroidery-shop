import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  const r = await p.product.findMany({ take: 1 });
  console.log('OK:', r.length);
} catch(e) {
  console.error(e);
} finally {
  await p.$disconnect();
}
