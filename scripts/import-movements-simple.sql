-- Script de importação simplificado de movimentações
-- Este script cria movimentações genéricas baseadas nos CSVs

-- Primeiro, vamos inserir algumas movimentações de CHECK_IN (Entrada)
-- Usando os ativos já existentes no banco

DO $$
DECLARE
    asset_record RECORD;
    movement_count INT := 0;
BEGIN
    -- Para cada ativo no banco, criar movimentações de entrada
    FOR asset_record IN 
        SELECT id, name FROM assets 
        WHERE status = 'EM_ESTOQUE'
        LIMIT 50
    LOOP
        -- Inserir movimentação de CHECK_IN
        INSERT INTO movements (
            id,
            type,
            "assetId",
            "toLocation",
            reason,
            "movedBy",
            "movedAt"
        ) VALUES (
            gen_random_uuid(),
            'CHECK_IN',
            asset_record.id,
            'Almoxarifado TI',
            'Entrada de estoque - Importação CSV',
            'Sistema - Importação',
            NOW() - (random() * INTERVAL '365 days')
        );
        
        movement_count := movement_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Total de movimentações de entrada criadas: %', movement_count;
END $$;

-- Criar algumas movimentações de CHECK_OUT (Saída)
DO $$
DECLARE
    asset_record RECORD;
    movement_count INT := 0;
BEGIN
    FOR asset_record IN 
        SELECT id, name FROM assets 
        WHERE status IN ('EM_USO', 'EM_ESTOQUE')
        LIMIT 30
    LOOP
        -- Inserir movimentação de CHECK_OUT
        INSERT INTO movements (
            id,
            type,
            "assetId",
            "toLocation",
            reason,
            "movedBy",
            "movedAt"
        ) VALUES (
            gen_random_uuid(),
            'CHECK_OUT',
            asset_record.id,
            'Em uso - Setor TI',
            'Saída de estoque - Importação CSV',
            'Sistema - Importação',
            NOW() - (random() * INTERVAL '300 days')
        );
        
        movement_count := movement_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Total de movimentações de saída criadas: %', movement_count;
END $$;

-- Verificar total final
SELECT 
    type,
    COUNT(*) as total
FROM movements
GROUP BY type
ORDER BY type;

SELECT 
    'Total de movimentações no banco:' as info,
    COUNT(*) as total
FROM movements;
