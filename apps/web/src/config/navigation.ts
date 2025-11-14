import {
  LayoutDashboard,
  Package,
  MapPin,
  TrendingUp,
  FileKey,
  Settings,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Visão geral do sistema',
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        title: 'Ativos',
        href: '/assets',
        icon: Package,
        description: 'Gerenciar ativos de TI',
      },
      {
        title: 'Movimentações',
        href: '/movements',
        icon: TrendingUp,
        description: 'Histórico de movimentações',
      },
      {
        title: 'Licenças',
        href: '/licenses',
        icon: FileKey,
        description: 'Licenças de software',
      },
    ],
  },
  {
    title: 'Configurações',
    items: [
      {
        title: 'Categorias',
        href: '/categories',
        icon: Settings,
        description: 'Gerenciar categorias',
      },
      {
        title: 'Localizações',
        href: '/locations',
        icon: MapPin,
        description: 'Gerenciar localizações',
      },
    ],
  },
  {
    title: 'Relatórios',
    items: [
      {
        title: 'Relatórios',
        href: '/reports',
        icon: BarChart3,
        description: 'Visualizar relatórios',
      },
    ],
  },
];
