# 🎨 FRONTEND STACK & PLANO DE IMPLEMENTAÇÃO

**Data:** 12 de Novembro de 2025  
**Especialista:** Web Designer & Frontend Architect  
**Projeto:** HSI Stock Management System  
**Status Backend:** 100% completo (47 endpoints REST)

---

## 📊 ANÁLISE DO STACK ATUAL

### ✅ Stack Já Configurado (Excelente para 2025)

```json
Core Framework:
✅ Next.js 14 (App Router) - SSR, RSC, File-based routing
✅ React 18.3 - Latest stable with Concurrent features
✅ TypeScript 5.6 - Type safety full-stack

Styling:
✅ Tailwind CSS 3.4 - Utility-first CSS framework
✅ CSS Variables - Theming system configurado
✅ class-variance-authority - Component variants
✅ clsx + tailwind-merge - Class name utilities

State Management:
✅ Zustand 5.0 - Lightweight state management
✅ TanStack Query 5.59 - Server state management

HTTP Client:
✅ Axios 1.7 - API integration

Icons:
✅ Lucide React - Modern icon library (3000+ icons)
```

### 🎯 Avaliação: STACK APROVADO ✅

**Justificativa:**
- ✅ **Next.js 14** é o framework React mais moderno e performático
- ✅ **Tailwind CSS** é o padrão da indústria em 2025
- ✅ **TanStack Query** é superior ao Redux para API calls
- ✅ **Zustand** é mais simples e performático que Context API
- ✅ Todas as versões são as mais recentes e estáveis

---

## 🎨 COMPONENTES UI RECOMENDADOS

### Opção 1: shadcn/ui (RECOMENDADO) 🌟

**Por que shadcn/ui?**
- ✅ **Copy-paste components** - Não é npm package, você tem controle total
- ✅ **Radix UI primitives** - Acessibilidade AAA out-of-the-box
- ✅ **Totalmente customizável** - Código fonte no seu projeto
- ✅ **Tailwind-first** - Integração perfeita
- ✅ **Zero dependencies extras** - Apenas Radix primitives
- ✅ **Usado por empresas top** - Vercel, Linear, Cal.com

**Componentes que vamos usar:**
```
✅ Button, Input, Select, Checkbox, Radio
✅ Dialog (Modal), Sheet (Sidebar), Popover, Dropdown
✅ Table, DataTable (com sorting, filtering, pagination)
✅ Form (react-hook-form + zod integration)
✅ Toast (notifications)
✅ Tabs, Accordion, Collapsible
✅ Calendar, DatePicker
✅ Badge, Avatar, Card
✅ Command (⌘K menu)
✅ Alert, AlertDialog
```

### Opção 2: MUI (Material-UI) ❌ NÃO RECOMENDADO

**Por que NÃO usar MUI?**
- ❌ Bundle size muito grande (~300KB)
- ❌ Design opinativo difícil de customizar
- ❌ Performance inferior
- ❌ Conflito com Tailwind CSS
- ❌ Não combina com stack moderno

---

## 🏗️ ARQUITETURA FRONTEND PROPOSTA

### Estrutura de Pastas

```
apps/web/src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected routes group
│   │   ├── layout.tsx            # Main layout com sidebar
│   │   ├── page.tsx              # Dashboard home
│   │   ├── assets/
│   │   │   ├── page.tsx          # Lista de ativos
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Detalhes do ativo
│   │   │   └── new/
│   │   │       └── page.tsx      # Criar ativo
│   │   ├── movements/
│   │   │   ├── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   ├── licenses/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   ├── categories/
│   │   │   ├── locations/
│   │   │   ├── manufacturers/
│   │   │   └── suppliers/
│   │   └── reports/
│   │       └── page.tsx
│   ├── api/                      # API routes (opcional)
│   │   └── auth/
│   │       └── [...nextauth]/
│   ├── globals.css
│   └── layout.tsx
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── breadcrumbs.tsx
│   │   └── footer.tsx
│   ├── assets/                   # Asset-specific components
│   │   ├── asset-form.tsx
│   │   ├── asset-table.tsx
│   │   ├── asset-filters.tsx
│   │   └── asset-card.tsx
│   ├── movements/                # Movement-specific components
│   │   ├── movement-form.tsx
│   │   ├── movement-history.tsx
│   │   └── movement-timeline.tsx
│   ├── licenses/                 # License-specific components
│   │   ├── license-form.tsx
│   │   ├── license-table.tsx
│   │   └── license-assignment.tsx
│   ├── dashboard/                # Dashboard components
│   │   ├── stats-card.tsx
│   │   ├── recent-movements.tsx
│   │   └── asset-chart.tsx
│   └── shared/                   # Shared components
│       ├── data-table.tsx        # Generic data table
│       ├── loading-skeleton.tsx
│       ├── error-boundary.tsx
│       └── empty-state.tsx
│
├── lib/                          # Utilities
│   ├── api.ts                    # Axios instance configurado
│   ├── auth.ts                   # Auth utilities
│   ├── utils.ts                  # Helper functions
│   ├── validations.ts            # Zod schemas
│   └── constants.ts              # Constants/enums
│
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts               # Auth hook
│   ├── use-assets.ts             # Assets queries
│   ├── use-movements.ts          # Movements queries
│   ├── use-licenses.ts           # Licenses queries
│   ├── use-toast.ts              # Toast notifications
│   └── use-debounce.ts           # Debounce utility
│
├── store/                        # Zustand stores
│   ├── auth-store.ts             # Auth state
│   ├── ui-store.ts               # UI state (sidebar, theme)
│   └── filters-store.ts          # Filters state
│
├── types/                        # TypeScript types
│   ├── api.ts                    # API response types
│   ├── entities.ts               # Entity types (Asset, User, etc)
│   └── forms.ts                  # Form types
│
└── config/                       # Configuration
    ├── site.ts                   # Site metadata
    └── navigation.ts             # Navigation menu config
```

---

## 🎨 DESIGN SYSTEM

### Paleta de Cores (Healthcare/Hospital theme)

```css
/* Tema Claro (Default) */
--primary: 200 100% 45%;          /* #00A3E0 - Azul médico confiável */
--primary-foreground: 0 0% 100%;  /* #FFFFFF */

--secondary: 200 20% 95%;         /* #EBF5F9 - Azul muito claro */
--secondary-foreground: 200 40% 20%; /* #1A3D4D */

--accent: 150 60% 50%;            /* #33CC99 - Verde saúde */
--accent-foreground: 0 0% 100%;   /* #FFFFFF */

--destructive: 0 85% 60%;         /* #E64545 - Vermelho para ações críticas */
--destructive-foreground: 0 0% 100%;

--muted: 200 10% 96%;             /* #F5F7F8 - Cinza claro */
--muted-foreground: 200 10% 45%;  /* #6B7D87 */

--background: 0 0% 100%;          /* #FFFFFF */
--foreground: 200 20% 10%;        /* #141B1F */

--card: 0 0% 100%;                /* #FFFFFF */
--card-foreground: 200 20% 10%;

--border: 200 15% 85%;            /* #CDD7DC */
--input: 200 15% 85%;
--ring: 200 100% 45%;             /* Focus ring */

/* Tema Escuro */
.dark {
  --primary: 200 100% 50%;
  --primary-foreground: 0 0% 100%;
  
  --secondary: 200 30% 15%;
  --secondary-foreground: 0 0% 95%;
  
  --accent: 150 60% 50%;
  --accent-foreground: 0 0% 10%;
  
  --destructive: 0 85% 55%;
  --destructive-foreground: 0 0% 100%;
  
  --muted: 200 20% 20%;
  --muted-foreground: 200 10% 70%;
  
  --background: 200 25% 8%;      /* #0D1215 - Quase preto com toque azul */
  --foreground: 0 0% 95%;        /* #F2F2F2 */
  
  --card: 200 25% 12%;
  --card-foreground: 0 0% 95%;
  
  --border: 200 20% 25%;
  --input: 200 20% 25%;
  --ring: 200 100% 50%;
}
```

### Tipografia

```css
/* Font Stack */
font-family: 
  'Inter', 
  -apple-system, 
  BlinkMacSystemFont, 
  'Segoe UI', 
  'Roboto', 
  'Helvetica Neue', 
  sans-serif;

/* Font Sizes */
--font-xs: 0.75rem;      /* 12px */
--font-sm: 0.875rem;     /* 14px */
--font-base: 1rem;       /* 16px */
--font-lg: 1.125rem;     /* 18px */
--font-xl: 1.25rem;      /* 20px */
--font-2xl: 1.5rem;      /* 24px */
--font-3xl: 1.875rem;    /* 30px */
--font-4xl: 2.25rem;     /* 36px */
```

### Spacing & Layout

```css
/* Container max-width */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Sidebar */
--sidebar-width: 280px;
--sidebar-collapsed: 64px;

/* Header */
--header-height: 64px;

/* Spacing scale (Tailwind default) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

---

## 🔧 DEPENDÊNCIAS ADICIONAIS NECESSÁRIAS

```json
{
  "dependencies": {
    // Já instaladas ✅
    "@tanstack/react-query": "^5.59.20",
    "axios": "^1.7.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "next": "^14.2.18",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.4",
    "zustand": "^5.0.1",
    
    // A INSTALAR 🆕
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.4",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.1.5",
    
    "@tanstack/react-table": "^8.20.5",      // DataTable com sorting/filtering
    "react-hook-form": "^7.54.2",            // Form management
    "zod": "^3.24.1",                        // Schema validation
    "@hookform/resolvers": "^3.9.1",         // Zod + RHF integration
    "date-fns": "^4.1.0",                    // Date utilities
    "recharts": "^2.15.0",                   // Charts para dashboard
    "cmdk": "^1.0.4",                        // Command menu (⌘K)
    "sonner": "^1.7.3",                      // Toast notifications (melhor que radix)
    "vaul": "^1.1.1",                        // Mobile drawer
    "next-themes": "^0.4.4"                  // Theme switching
  },
  "devDependencies": {
    // A INSTALAR 🆕
    "@tanstack/eslint-plugin-query": "^5.59.20",
    "prettier": "^3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.9"
  }
}
```

---

## 📋 PLANO DE IMPLEMENTAÇÃO (42h)

### Sprint 1: Foundation & Setup (8h) 🏗️

#### Dia 1 (8h)
- [x] **1.1 - Setup shadcn/ui (2h)**
  - Instalar dependências Radix UI
  - Configurar components.json
  - Adicionar componentes base: Button, Input, Label, Form
  - Configurar Sonner (toast)
  - Setup next-themes

- [x] **1.2 - API Integration Layer (2h)**
  - Configurar Axios instance (`lib/api.ts`)
  - Setup TanStack Query client
  - Criar hooks base: useAuth, useToast
  - Error handling global

- [x] **1.3 - Authentication (4h)**
  - Página de login + form
  - Auth store (Zustand)
  - Protected route middleware
  - JWT storage (httpOnly cookies ou localStorage)
  - Redirect logic

**Entregáveis:** 
- ✅ Login funcional
- ✅ API client configurado
- ✅ Protected routes

---

### Sprint 2: Layout & Navigation (6h) 🎨

#### Dia 2 (6h)
- [ ] **2.1 - Layout Components (4h)**
  - Sidebar com navegação
  - Header com breadcrumbs + user menu
  - Mobile sidebar (Sheet component)
  - Theme toggle (dark/light)
  - Logo e branding

- [ ] **2.2 - Navigation System (2h)**
  - Config de navegação (`config/navigation.ts`)
  - Active state highlighting
  - Sidebar collapse/expand
  - Responsive behavior

**Entregáveis:**
- ✅ Layout completo desktop/mobile
- ✅ Navegação funcional
- ✅ Dark mode toggle

---

### Sprint 3: Dashboard Home (8h) 📊

#### Dia 3 (8h)
- [ ] **3.1 - Stats Cards (3h)**
  - Total de ativos (por status)
  - Licenças expirando
  - Movimentações recentes (count)
  - Cards responsivos com ícones

- [ ] **3.2 - Charts (3h)**
  - Ativos por categoria (Pie chart)
  - Movimentações por mês (Line chart)
  - Status de ativos (Bar chart)
  - Integração com Recharts

- [ ] **3.3 - Recent Activity (2h)**
  - Tabela de movimentações recentes
  - Link para detalhes
  - Loading states
  - Empty states

**Entregáveis:**
- ✅ Dashboard visual e informativo
- ✅ Gráficos funcionais
- ✅ Dados da API exibidos

---

### Sprint 4: Assets CRUD (12h) 💻

#### Dia 4 (8h)
- [ ] **4.1 - Assets List Page (4h)**
  - DataTable com TanStack Table
  - Colunas: Tag, Nome, Categoria, Status, Localização
  - Sorting por colunas
  - Filtros: Categoria, Status, Localização
  - Search por tag/nome
  - Paginação
  - Botão "Novo Ativo"

- [ ] **4.2 - Asset Form (4h)**
  - Form com React Hook Form + Zod
  - Campos: tag, name, description, category, location, manufacturer, supplier, etc
  - Selects com search (Combobox)
  - Validações
  - Submit com TanStack Mutation
  - Toast de sucesso/erro

#### Dia 5 (4h)
- [ ] **4.3 - Asset Details Page (2h)**
  - Informações completas do ativo
  - Histórico de movimentações
  - Botões: Editar, Deletar, Movimentar
  - Status badge

- [ ] **4.4 - Delete & Edit (2h)**
  - Modal de confirmação (AlertDialog)
  - Edit form (reuso do create form)
  - Soft delete implementation

**Entregáveis:**
- ✅ CRUD completo de Assets
- ✅ Listagem com filtros e paginação
- ✅ Formulário validado

---

### Sprint 5: Movements CRUD (8h) 🚚

#### Dia 6 (8h)
- [ ] **5.1 - Movements List (3h)**
  - DataTable de movimentações
  - Colunas: Data, Tipo, Ativo, Usuário, Origem, Destino
  - Filtros: Tipo, Data, Ativo, Usuário
  - Status badges coloridos

- [ ] **5.2 - Movement Form (3h)**
  - Form de registro de movimentação
  - Selects: Tipo, Ativo, Usuário, Localização
  - Validações condicionais (toLocation obrigatório em TRANSFER)
  - Campos: reason, ticketNumber
  - Submit

- [ ] **5.3 - Movement Timeline (2h)**
  - Timeline visual de movimentações (em Asset Details)
  - Ícones por tipo de movimento
  - Datas formatadas

**Entregáveis:**
- ✅ Registro de movimentações funcional
- ✅ Histórico visual
- ✅ Filtros avançados

---

### Sprint 6: Licenses & Settings (6h) 📜

#### Dia 7 (6h)
- [ ] **6.1 - Licenses CRUD (4h)**
  - Lista de licenças
  - Form de criação/edição
  - Progress bar de seats (usedSeats/totalSeats)
  - Badge de status (ATIVA/EXPIRADA)
  - Botão "Atribuir licença"
  - Modal de atribuição (assign form)

- [ ] **6.2 - Settings Pages (2h)**
  - Categories CRUD (simple table + form)
  - Locations CRUD
  - Manufacturers CRUD
  - Suppliers CRUD
  - (Reuso de componentes genéricos)

**Entregáveis:**
- ✅ Licenses completo
- ✅ Admin settings funcionais

---

### Sprint 7: Polish & Extras (4h) ✨

#### Dia 8 (4h)
- [ ] **7.1 - UX Improvements (2h)**
  - Loading skeletons
  - Error boundaries
  - Empty states illustrations
  - Keyboard shortcuts (Command menu)
  - Tooltips

- [ ] **7.2 - Responsive Testing (1h)**
  - Mobile testing
  - Tablet testing
  - Safari/Firefox testing

- [ ] **7.3 - Performance (1h)**
  - Image optimization
  - Code splitting check
  - Lighthouse audit
  - React Query cache optimization

**Entregáveis:**
- ✅ UX polido
- ✅ 100% responsive
- ✅ Performance otimizada

---

## 🎯 FEATURES PRIORITIZADAS

### Must Have (MVP) ✅
1. ✅ Login/Auth
2. ✅ Dashboard com stats
3. ✅ Assets CRUD completo
4. ✅ Movements CRUD
5. ✅ Licenses CRUD
6. ✅ Settings (Categories, Locations, etc)
7. ✅ Dark mode
8. ✅ Responsive design

### Should Have (v1.1) 🟡
1. 🟡 Reports page (export CSV/PDF)
2. 🟡 Advanced filters (date ranges, multi-select)
3. 🟡 Bulk actions (select múltiplos assets)
4. 🟡 Command menu (⌘K global search)
5. 🟡 User management (admin only)

### Could Have (v2.0) ⚪
1. ⚪ QR Code generation/scanning
2. ⚪ Asset photos upload
3. ⚪ Email notifications
4. ⚪ Audit log viewer
5. ⚪ Advanced charts (custom date ranges)
6. ⚪ Import CSV wizard
7. ⚪ Print labels

---

## 🚀 COMANDOS DE SETUP

```bash
# 1. Instalar dependências
cd apps/web
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip @tanstack/react-table react-hook-form zod @hookform/resolvers date-fns recharts cmdk sonner vaul next-themes

# 2. Instalar devDependencies
npm install -D @tanstack/eslint-plugin-query prettier prettier-plugin-tailwindcss

# 3. Init shadcn/ui
npx shadcn@latest init

# 4. Adicionar componentes shadcn
npx shadcn@latest add button input label form toast dialog dropdown-menu select table tabs card badge avatar separator

# 5. Rodar dev server
npm run dev
```

---

## 📐 PADRÕES DE CÓDIGO

### Componente Exemplo

```typescript
// components/assets/asset-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAsset } from '@/lib/api';

const assetSchema = z.object({
  tag: z.string().min(1, 'Tag é obrigatória'),
  name: z.string().min(1, 'Nome é obrigatório'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  locationId: z.string().min(1, 'Localização é obrigatória'),
  // ... outros campos
});

type AssetFormData = z.infer<typeof assetSchema>;

export function AssetForm() {
  const queryClient = useQueryClient();
  
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      tag: '',
      name: '',
      categoryId: '',
      locationId: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Ativo criado com sucesso!');
      form.reset();
    },
    onError: (error) => {
      toast.error('Erro ao criar ativo');
      console.error(error);
    },
  });

  const onSubmit = (data: AssetFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag do Ativo</FormLabel>
              <FormControl>
                <Input placeholder="HSI-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Mais campos... */}
        
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando...' : 'Criar Ativo'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 🎨 UI/UX GUIDELINES

### Princípios de Design

1. **Clarity First** - Informação clara e objetiva
2. **Consistency** - Padrões visuais consistentes
3. **Feedback** - Sempre dar feedback visual (loading, success, error)
4. **Accessibility** - WCAG 2.1 AA compliance
5. **Performance** - <3s FCP, <5s LCP

### Micro-interactions

```typescript
// Hover states
className="hover:bg-primary/90 transition-colors"

// Active states
className="active:scale-95 transition-transform"

// Loading states
{isLoading && <Spinner />}

// Success animations
toast.success('✓ Salvo com sucesso')

// Error states
<ErrorAlert message={error.message} />
```

---

## ✅ CHECKLIST DE QUALIDADE

### Antes de cada commit
- [ ] TypeScript sem erros
- [ ] ESLint sem warnings
- [ ] Componentes responsivos (mobile, tablet, desktop)
- [ ] Dark mode funciona
- [ ] Loading states implementados
- [ ] Error boundaries
- [ ] Acessibilidade (keyboard navigation, ARIA labels)

### Antes de cada merge
- [ ] Lighthouse score > 90
- [ ] Testado em Chrome, Firefox, Safari
- [ ] Mobile testado
- [ ] Forms validados
- [ ] API errors tratados

---

## 🎯 RESUMO EXECUTIVO

### Stack Final Aprovado ✅

```
Framework:     Next.js 14 (App Router)
UI Library:    shadcn/ui + Radix UI
Styling:       Tailwind CSS 3.4
State:         Zustand + TanStack Query
Forms:         React Hook Form + Zod
Charts:        Recharts
Icons:         Lucide React
Notifications: Sonner
Theme:         next-themes
```

### Timeline

```
Sprint 1: Foundation (8h)     → Dias 1
Sprint 2: Layout (6h)          → Dia 2
Sprint 3: Dashboard (8h)       → Dia 3
Sprint 4: Assets (12h)         → Dias 4-5
Sprint 5: Movements (8h)       → Dia 6
Sprint 6: Licenses (6h)        → Dia 7
Sprint 7: Polish (4h)          → Dia 8

TOTAL: 42 horas (8 dias úteis)
```

### Próximo Passo IMEDIATO

1. ✅ Aprovar este plano
2. ▶️ Instalar dependências shadcn/ui
3. ▶️ Começar Sprint 1: Authentication

---

**Status:** 📋 PLANO APROVADO - PRONTO PARA IMPLEMENTAÇÃO  
**Estimativa:** 42h (8 dias úteis)  
**Prioridade:** 🔴 ALTA - Backend 100% aguardando frontend
