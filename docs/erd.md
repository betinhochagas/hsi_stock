# Diagrama de Entidade-Relacionamento (ERD)

```mermaid
erDiagram
    User ||--o{ Asset : creates
    User ||--o{ Asset : "assigned to"
    User ||--o{ Movement : performs
    User ||--o{ Maintenance : "responsible for"
    User ||--o{ ImportLog : executes
    User ||--o{ AuditLog : generates
    
    Asset ||--o{ Movement : has
    Asset ||--o{ Maintenance : requires
    Asset ||--o{ Attachment : contains
    Asset }o--|| Category : "belongs to"
    Asset }o--o| Location : "located at"
    Asset }o--o| Manufacturer : "made by"
    Asset }o--o| Supplier : "supplied by"
    Asset }o--o{ Contract : covered
    
    License ||--o{ LicenseAssignment : "assigned to"
    License }o--o{ Contract : covered
    
    Contract }o--o| Supplier : "signed with"
    Contract ||--o{ Attachment : has
    
    User {
        string id PK
        string email UK
        string password
        string name
        enum role
        boolean active
        datetime createdAt
        datetime updatedAt
    }
    
    Asset {
        string id PK
        string assetTag UK
        string name
        string description
        string serialNumber
        string model
        enum status
        date purchaseDate
        decimal purchasePrice
        date warrantyUntil
        string observations
        string locationId FK
        string assignedToId FK
        string categoryId FK
        string manufacturerId FK
        string supplierId FK
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }
    
    Category {
        string id PK
        string name UK
        string description
        string icon
        string color
        datetime createdAt
        datetime updatedAt
    }
    
    Location {
        string id PK
        string name UK
        string description
        string building
        string floor
        string room
        datetime createdAt
        datetime updatedAt
    }
    
    Manufacturer {
        string id PK
        string name UK
        string website
        string supportPhone
        string supportEmail
        datetime createdAt
        datetime updatedAt
    }
    
    Supplier {
        string id PK
        string name UK
        string cnpj UK
        string contact
        string email
        string phone
        string address
        datetime createdAt
        datetime updatedAt
    }
    
    License {
        string id PK
        string name
        string licenseKey UK
        int totalSeats
        int usedSeats
        date purchaseDate
        date expirationDate
        enum status
        decimal cost
        string vendor
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    LicenseAssignment {
        string id PK
        string licenseId FK
        string deviceName
        string userName
        string email
        datetime assignedAt
        datetime revokedAt
    }
    
    Contract {
        string id PK
        enum type
        string contractNumber UK
        date startDate
        date endDate
        decimal cost
        string description
        string terms
        string supplierId FK
        datetime createdAt
        datetime updatedAt
    }
    
    Movement {
        string id PK
        enum type
        string assetId FK
        string fromLocationId FK
        string toLocation
        string userId FK
        string reason
        string ticketNumber
        datetime movedAt
        string movedBy
    }
    
    Maintenance {
        string id PK
        string assetId FK
        enum status
        string title
        string description
        datetime reportedAt
        datetime startedAt
        datetime completedAt
        string technicianId FK
        decimal cost
        string parts
        string solution
    }
    
    Attachment {
        string id PK
        string filename
        string originalName
        string mimeType
        int size
        string path
        string assetId FK
        string contractId FK
        datetime uploadedAt
    }
    
    ImportLog {
        string id PK
        string filename
        string originalName
        enum status
        int totalRows
        int successRows
        int errorRows
        string errors
        string metadata
        datetime startedAt
        datetime completedAt
        string userId FK
    }
    
    AuditLog {
        string id PK
        enum action
        string entityType
        string entityId
        string changes
        string metadata
        string userId FK
        string ipAddress
        string userAgent
        datetime createdAt
    }
```

## Enums

### UserRole
- `ADMIN`: Acesso total ao sistema
- `GESTOR`: Gerencia ativos, aprovações
- `TECNICO`: Operações técnicas, manutenções
- `LEITOR`: Somente leitura

### AssetStatus
- `EM_ESTOQUE`: Disponível no estoque
- `EM_USO`: Atribuído e em uso
- `EM_MANUTENCAO`: Em manutenção/reparo
- `INATIVO`: Desativado/obsoleto
- `DESCARTADO`: Descartado

### LicenseStatus
- `ATIVA`: Licença ativa
- `EXPIRADA`: Licença expirada
- `CANCELADA`: Licença cancelada

### ContractType
- `GARANTIA`: Contrato de garantia
- `MANUTENCAO`: Contrato de manutenção
- `SUPORTE`: Contrato de suporte técnico
- `LOCACAO`: Contrato de locação

### MovementType
- `CHECK_IN`: Entrada no estoque
- `CHECK_OUT`: Saída do estoque
- `TRANSFER`: Transferência entre locais
- `ASSIGNMENT`: Atribuição a usuário
- `RETURN`: Devolução

### MaintenanceStatus
- `ABERTA`: Manutenção aberta
- `EM_ANDAMENTO`: Em andamento
- `AGUARDANDO_PECA`: Aguardando peça
- `CONCLUIDA`: Concluída
- `CANCELADA`: Cancelada

### ImportStatus
- `PENDING`: Pendente
- `PROCESSING`: Processando
- `COMPLETED`: Concluído
- `FAILED`: Falhou

### AuditAction
- `CREATE`: Criação
- `UPDATE`: Atualização
- `DELETE`: Exclusão
- `LOGIN`: Login
- `LOGOUT`: Logout
- `IMPORT`: Importação
- `EXPORT`: Exportação

## Índices

Os seguintes índices são criados para otimizar queries:

- `Asset`: `assetTag`, `serialNumber`, `status`, `categoryId`, `locationId`
- `License`: `expirationDate`
- `Contract`: `endDate`
- `Movement`: `assetId`, `movedAt`
- `Maintenance`: `assetId`, `status`
- `Attachment`: `assetId`
- `ImportLog`: `status`, `startedAt`
- `AuditLog`: `(entityType, entityId)`, `userId`, `createdAt`
