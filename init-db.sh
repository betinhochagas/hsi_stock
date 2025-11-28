#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Garantir que o usuário existe e tem a senha correta
    ALTER USER estoque_user WITH PASSWORD 'admin';
    
    -- Dar permissões
    GRANT ALL PRIVILEGES ON DATABASE estoque_hsi TO estoque_user;
EOSQL
