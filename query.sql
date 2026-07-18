SELECT p.id, p.name, p.color, p.size, p.price::text, p.stock, 
       pv.id as vid, pv.size as vsize, pv.color as vcolor, pv.price::text as vprice, pv.stock as vstock 
FROM "Product" p 
LEFT JOIN "ProductVariant" pv ON pv."productId" = p.id 
ORDER BY p.id;
