-- Seed do banco de dados HSI Stock

-- Inserir usuários
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@hsi.local', '$2a$10$IuY/CERUqEV.qmEtsHoQJeQs91JYlIjowTjC.HHLTt3Wp5PHl6WdO', 'Administrador', 'ADMIN', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'gestor@hsi.local', '$2a$10$EHl91VJqB/ZSkRXHuS0jAufauAkC2LTAVuowubhYa8rZp7.GBFV7C', 'Gestor TI', 'GESTOR', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'tecnico@hsi.local', '$2a$10$dTgfzv9cpKZUl6CKoMuONugEYV.twkt6MZoRxZIlZMl312kWL0bI2', 'Técnico Suporte', 'TECNICO', NOW(), NOW());

-- Inserir categorias
INSERT INTO categories (id, name, description, icon, color, "createdAt", "updatedAt") VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Desktop', 'Computadores de mesa', 'desktop', '#3b82f6', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'Notebook', 'Computadores portáteis', 'laptop', '#8b5cf6', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440003', 'Monitor', 'Monitores e displays', 'monitor', '#06b6d4', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440004', 'Periféricos', 'Teclados, mouses, webcams, etc.', 'mouse', '#10b981', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440005', 'Rede', 'Cabos, adaptadores, roteadores', 'network', '#f59e0b', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440006', 'Impressora', 'Impressoras e scanners', 'printer', '#ef4444', NOW(), NOW());

-- Inserir localizações
INSERT INTO locations (id, name, description, building, floor, room, "createdAt", "updatedAt") VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Almoxarifado TI', 'Estoque principal de TI', 'Bloco A', '1º Andar', NULL, NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440002', 'TI - Sala 102', 'Sala de suporte técnico', 'Bloco A', '1º Andar', '102', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440003', 'Ambulatório', 'Ambulatório de especialidades', 'Bloco B', 'Térreo', NULL, NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440004', 'Diretoria', 'Sala da diretoria', 'Bloco A', '2º Andar', NULL, NOW(), NOW());

-- Inserir fabricantes
INSERT INTO manufacturers (id, name, website, "supportPhone", "createdAt", "updatedAt") VALUES
('850e8400-e29b-41d4-a716-446655440001', 'DELL', 'https://www.dell.com', '0800-970-3355', NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440002', 'HP', 'https://www.hp.com', '0800-157-751', NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440003', 'Lenovo', 'https://www.lenovo.com', NULL, NOW(), NOW());

-- Inserir fornecedor
INSERT INTO suppliers (id, name, cnpj, email, phone, "createdAt", "updatedAt") VALUES
('950e8400-e29b-41d4-a716-446655440001', 'TechSupply Ltda', '12.345.678/0001-90', 'contato@techsupply.com', '(11) 3456-7890', NOW(), NOW());

-- Inserir ativos - 10 desktops
INSERT INTO assets (id, "assetTag", name, description, "serialNumber", model, status, "purchaseDate", "purchasePrice", "warrantyUntil", "categoryId", "manufacturerId", "locationId", "supplierId", "createdById", "assignedToId", "assignedAt", "createdAt", "updatedAt") VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'HSI230001', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230001', 'OptiPlex 7020', 'EM_USO', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440002', 'HSI230002', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230002', 'OptiPlex 7020', 'EM_USO', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440003', 'HSI230003', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230003', 'OptiPlex 7020', 'EM_USO', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440004', 'HSI230004', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230004', 'OptiPlex 7020', 'EM_USO', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440005', 'HSI230005', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230005', 'OptiPlex 7020', 'EM_USO', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440006', 'HSI230006', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230006', 'OptiPlex 7020', 'EM_ESTOQUE', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440007', 'HSI230007', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230007', 'OptiPlex 7020', 'EM_ESTOQUE', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440008', 'HSI230008', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230008', 'OptiPlex 7020', 'EM_ESTOQUE', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440009', 'HSI230009', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230009', 'OptiPlex 7020', 'EM_ESTOQUE', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440010', 'HSI230010', 'Desktop OPTIPLEX 7020', 'Desktop Dell OptiPlex 7020', 'DT230010', 'OptiPlex 7020', 'EM_ESTOQUE', '2024-01-15', 3500.00, '2027-01-15', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NULL, NULL, NOW(), NOW());

-- Inserir monitores
INSERT INTO assets (id, "assetTag", name, description, "serialNumber", model, status, "purchaseDate", "purchasePrice", "categoryId", "manufacturerId", "locationId", "createdById", "createdAt", "updatedAt") VALUES
('a50e8400-e29b-41d4-a716-446655440101', 'HSI230101', 'Monitor Dell P2425H', 'Monitor Dell 24" Full HD', 'MON230101', 'P2425H', 'EM_ESTOQUE', '2024-07-01', 850.00, '650e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440102', 'HSI230102', 'Monitor Dell P2425H', 'Monitor Dell 24" Full HD', 'MON230102', 'P2425H', 'EM_ESTOQUE', '2024-07-01', 850.00, '650e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440103', 'HSI230103', 'Monitor Dell P2425H', 'Monitor Dell 24" Full HD', 'MON230103', 'P2425H', 'EM_ESTOQUE', '2024-07-01', 850.00, '650e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440104', 'HSI230104', 'Monitor Dell P2425H', 'Monitor Dell 24" Full HD', 'MON230104', 'P2425H', 'EM_ESTOQUE', '2024-07-01', 850.00, '650e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('a50e8400-e29b-41d4-a716-446655440105', 'HSI230105', 'Monitor Dell P2425H', 'Monitor Dell 24" Full HD', 'MON230105', 'P2425H', 'EM_ESTOQUE', '2024-07-01', 850.00, '650e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- Inserir periférico sem patrimônio
INSERT INTO assets (id, name, description, status, "categoryId", "locationId", "createdById", "createdAt", "updatedAt") VALUES
('a50e8400-e29b-41d4-a716-446655440200', 'Mouse USB', 'Mouse óptico USB padrão', 'EM_ESTOQUE', '650e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW());

-- Inserir licenças
INSERT INTO licenses (id, name, "licenseKey", "totalSeats", "usedSeats", "purchaseDate", "expirationDate", status, cost, vendor, "createdAt", "updatedAt") VALUES
('l50e8400-e29b-41d4-a716-446655440001', 'Microsoft Office 365 Business', 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX', 50, 35, '2024-01-01', '2025-12-31', 'ATIVA', 15000.00, 'Microsoft', NOW(), NOW()),
('l50e8400-e29b-41d4-a716-446655440002', 'Adobe Creative Cloud', NULL, 10, 8, '2024-03-01', '2025-02-28', 'ATIVA', 8000.00, 'Adobe', NOW(), NOW());

-- Inserir movimentações
INSERT INTO movements (id, type, "assetId", "userId", "toLocation", reason, "ticketNumber", "movedBy", "movedAt") VALUES
('m50e8400-e29b-41d4-a716-446655440001', 'CHECK_IN', 'a50e8400-e29b-41d4-a716-446655440001', NULL, 'Almoxarifado TI', 'Entrada inicial de estoque', NULL, 'Guilherme Flores', NOW()),
('m50e8400-e29b-41d4-a716-446655440002', 'ASSIGNMENT', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'TI - Sala 102', 'Atribuído para uso diário', 'TKT-12345', 'Guilherme Flores', NOW());
