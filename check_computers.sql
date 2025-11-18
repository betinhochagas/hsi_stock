-- Ver computadores recém importados
SELECT 
  name, 
  "assetTag",
  model,
  status,
  description
FROM assets 
WHERE name NOT LIKE '%Monitor%'
ORDER BY "createdAt" DESC 
LIMIT 5;
