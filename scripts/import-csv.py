#!/usr/bin/env python3
"""
Script para importar arquivos CSV para o sistema via API REST
Uso: python import-csv.py <arquivo.csv> <tipo>
Tipos: balance, entry, exit
"""

import requests
import sys
import json
import os
from pathlib import Path

API_URL = "http://localhost:3001/api/v1"
TOKEN = None  # Será preenchido após login

def login():
    """Faz login e retorna o token JWT"""
    response = requests.post(
        f"{API_URL}/auth/login",
        json={
            "email": "admin@hsi.local",
            "password": "admin123"
        }
    )
    if response.status_code in [200, 201]:
        data = response.json()
        return data.get("access_token")
    else:
        print(f"❌ Erro no login: {response.status_code}")
        print(response.text)
        sys.exit(1)

def upload_file(filepath, token):
    """Upload do arquivo CSV"""
    print(f"\n📤 Uploading {filepath}...")
    
    with open(filepath, 'rb') as f:
        files = {'file': (os.path.basename(filepath), f, 'text/csv')}
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.post(
            f"{API_URL}/import/upload",
            files=files,
            headers=headers
        )
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Upload OK: {data['filePath']}")
        return data['filePath']
    else:
        print(f"❌ Erro no upload: {response.status_code}")
        print(response.text)
        return None

def detect_format(file_path, token):
    """Detecta formato do CSV"""
    print(f"\n🔍 Detecting format...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        f"{API_URL}/import/detect",
        json={'filePath': file_path, 'skipRows': 2},
        headers=headers
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Encoding: {data['encoding']}")
        print(f"✅ Delimiter: '{data['delimiter']}'")
        print(f"✅ Headers: {data['headers'][:3]}...")
        print(f"✅ Total rows: ~{data['totalRows']}")
        return data
    else:
        print(f"❌ Erro na detecção: {response.status_code}")
        print(response.text)
        return None

def validate_import(file_path, file_type, config, token):
    """Valida CSV antes de importar (dry-run)"""
    print(f"\n✅ Validating {file_type}...")
    
    # Mapear tipo para colunas esperadas
    column_mappings = {
        'balance': {
            'Item': 'name',
            'Entradas': 'total_in',
            'Saídas': 'total_out',
            'Quantidade em estoque': 'quantity',
            'Observação': 'notes'
        },
        'entry': {
            'Item': 'name',
            'Serial Number/Service Tag': 'serial_number',
            'Patrimônio': 'asset_tag',
            'Quantidade': 'quantity',
            'Data de Entrada': 'entry_date',
            'Ticket': 'ticket_number'
        },
        'exit': {
            'Item': 'name',
            'Serial Number/Service Tag': 'serial_number',
            'Patrimônio': 'asset_tag',
            'Quantidade': 'quantity',
            'Data de Saída': 'exit_date',
            ' Ticket ': 'ticket_number'
        }
    }
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'filePath': file_path,
        'fileType': file_type,
        'columnMapping': column_mappings.get(file_type, {}),
        'config': {
            'encoding': config.get('encoding', 'latin1'),
            'delimiter': config.get('delimiter', ';'),
            'skipRows': 2
        }
    }
    
    response = requests.post(
        f"{API_URL}/import/validate",
        json=payload,
        headers=headers
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Valid rows: {data['validRows']}")
        print(f"⚠️  Error rows: {data['errorRows']}")
        print(f"⚠️  Warning rows: {data['warningRows']}")
        
        if data['errors']:
            print(f"\n❌ Errors found:")
            for error in data['errors'][:5]:  # Mostrar apenas 5 primeiros
                print(f"  Line {error['row']}: {error['field']} - {error['message']}")
        
        return data['isValid']
    else:
        print(f"❌ Erro na validação: {response.status_code}")
        print(response.text)
        return False

def commit_import(file_path, file_type, config, token):
    """Executa a importação definitiva"""
    print(f"\n✅ Committing import...")
    
    column_mappings = {
        'balance': {
            'Item': 'name',
            'Entradas': 'total_in',
            'Saídas': 'total_out',
            'Quantidade em estoque': 'quantity',
            'Observação': 'notes'
        },
        'entry': {
            'Item': 'name',
            'Serial Number/Service Tag': 'serial_number',
            'Patrimônio': 'asset_tag',
            'Quantidade': 'quantity',
            'Data de Entrada': 'entry_date',
            'Ticket': 'ticket_number'
        },
        'exit': {
            'Item': 'name',
            'Serial Number/Service Tag': 'serial_number',
            'Patrimônio': 'asset_tag',
            'Quantidade': 'quantity',
            'Data de Saída': 'exit_date',
            ' Ticket ': 'ticket_number'
        }
    }
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'filePath': file_path,
        'fileType': file_type,
        'columnMapping': column_mappings.get(file_type, {}),
        'config': {
            'encoding': config.get('encoding', 'latin1'),
            'delimiter': config.get('delimiter', ';'),
            'skipRows': 2,
            'createMovements': file_type in ['entry', 'exit'],
            'defaultCategory': 'Periféricos',
            'defaultLocation': 'Almoxarifado TI'
        }
    }
    
    response = requests.post(
        f"{API_URL}/import/commit",
        json=payload,
        headers=headers
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Import job created: {data['jobId']}")
        print(f"✅ Import log ID: {data['importLogId']}")
        print(f"✅ Status: {data['status']}")
        print(f"✅ {data['message']}")
        return True
    else:
        print(f"❌ Erro no commit: {response.status_code}")
        print(response.text)
        return False

def main():
    if len(sys.argv) < 3:
        print("Uso: python import-csv.py <arquivo.csv> <tipo>")
        print("Tipos: balance, entry, exit")
        sys.exit(1)
    
    filepath = sys.argv[1]
    file_type = sys.argv[2]
    
    if not os.path.exists(filepath):
        print(f"❌ Arquivo não encontrado: {filepath}")
        sys.exit(1)
    
    if file_type not in ['balance', 'entry', 'exit']:
        print(f"❌ Tipo inválido: {file_type}")
        print("Tipos válidos: balance, entry, exit")
        sys.exit(1)
    
    print("🔐 Logging in...")
    token = login()
    print(f"✅ Token obtained")
    
    # Upload
    uploaded_path = upload_file(filepath, token)
    if not uploaded_path:
        sys.exit(1)
    
    # Detect
    config = detect_format(uploaded_path, token)
    if not config:
        sys.exit(1)
    
    # Validate
    is_valid = validate_import(uploaded_path, file_type, config, token)
    if not is_valid:
        print("\n❌ Validation failed. Fix errors before importing.")
        sys.exit(1)
    
    # Commit
    print("\n⚠️  Ready to import. Press ENTER to continue or Ctrl+C to cancel...")
    input()
    
    success = commit_import(uploaded_path, file_type, config, token)
    
    if success:
        print("\n🎉 Import completed successfully!")
    else:
        print("\n❌ Import failed")
        sys.exit(1)

if __name__ == '__main__':
    main()
