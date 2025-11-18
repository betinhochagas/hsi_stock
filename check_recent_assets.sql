-- Ver assets criados recentemente
SELECT 
  name, 
  "assetTag",
  model,
  status,
  "createdAt"
FROM assets 
ORDER BY "createdAt" DESC 
LIMIT 10;
