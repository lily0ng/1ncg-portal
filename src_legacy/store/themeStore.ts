import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId =
'dark-nebula' |
'ocean-breeze' |
'forest-night' |
'sunset-pro' |
'arctic-light' |
'rose-gold' |
'monochrome';

export interface Theme {
  id: ThemeId;
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarBorder: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
  };
  isDark: boolean;
}

export const themes: Theme[] = [
{
  id: 'dark-nebula',
  name: 'Dark Nebula',
  isDark: true,
  colors: {
    background: '#0a0a0f',
    foreground: '#e2e8f0',
    card: '#12121a',
    cardForeground: '#e2e8f0',
    primary: '#6366f1',
    primaryForeground: '#ffffff',
    secondary: '#1e1e2e',
    secondaryForeground: '#e2e8f0',
    muted: '#1e1e2e',
    mutedForeground: '#94a3b8',
    accent: '#6366f1',
    accentForeground: '#ffffff',
    border: '#2a2a3e',
    input: '#2a2a3e',
    ring: '#6366f1',
    sidebar: '#11111a',
    sidebarForeground: '#e2e8f0',
    sidebarBorder: '#2a2a3e',
    sidebarAccent: '#1e1e30',
    sidebarAccentForeground: '#e2e8f0'
  }
},
{
  id: 'ocean-breeze',
  name: 'Ocean Breeze',
  isDark: true,
  colors: {
    background: '#0f1f2e',
    foreground: '#e2e8f0',
    card: '#152b40',
    cardForeground: '#e2e8f0',
    primary: '#06b6d4',
    primaryForeground: '#ffffff',
    secondary: '#1a3550',
    secondaryForeground: '#e2e8f0',
    muted: '#1a3550',
    mutedForeground: '#94a3b8',
    accent: '#06b6d4',
    accentForeground: '#ffffff',
    border: '#1e3a55',
    input: '#1e3a55',
    ring: '#06b6d4',
    sidebar: '#0c1a28',
    sidebarForeground: '#e2e8f0',
    sidebarBorder: '#1e3a55',
    sidebarAccent: '#152b40',
    sidebarAccentForeground: '#e2e8f0'
  }
},
{
  id: 'forest-night',
  name: 'Forest Night',
  isDark: true,
  colors: {
    background: '#0d1f0d',
    foreground: '#e2e8f0',
    card: '#122b12',
    cardForeground: '#e2e8f0',
    primary: '#22c55e',
    primaryForeground: '#ffffff',
    secondary: '#1a351a',
    secondaryForeground: '#e2e8f0',
    muted: '#1a351a',
    mutedForeground: '#94a3b8',
    accent: '#22c55e',
    accentForeground: '#ffffff',
    border: '#1e3a1e',
    input: '#1e3a1e',
    ring: '#22c55e',
    sidebar: '#0a1a0a',
    sidebarForeground: '#e2e8f0',
    sidebarBorder: '#1e3a1e',
    sidebarAccent: '#122b12',
    sidebarAccentForeground: '#e2e8f0'
  }
},
{
  id: 'sunset-pro',
  name: 'Sunset Pro',
  isDark: true,
  colors: {
    background: '#1a0f0f',
    foreground: '#e2e8f0',
    card: '#261616',
    cardForeground: '#e2e8f0',
    primary: '#f97316',
    primaryForeground: '#ffffff',
    secondary: '#2d1a1a',
    secondaryForeground: '#e2e8f0',
    muted: '#2d1a1a',
    mutedForeground: '#94a3b8',
    accent: '#f97316',
    accentForeground: '#ffffff',
    border: '#3a2020',
    input: '#3a2020',
    ring: '#f97316',
    sidebar: '#140c0c',
    sidebarForeground: '#e2e8f0',
    sidebarBorder: '#3a2020',
    sidebarAccent: '#261616',
    sidebarAccentForeground: '#e2e8f0'
  }
},
{
  id: 'arctic-light',
  name: 'Arctic Light',
  isDark: false,
  colors: {
    background: '#f8fafc',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#3b82f6',
    accentForeground: '#ffffff',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#3b82f6',
    sidebar: '#ffffff',
    sidebarForeground: '#0f172a',
    sidebarBorder: '#e2e8f0',
    sidebarAccent: '#f1f5f9',
    sidebarAccentForeground: '#0f172a'
  }
},
{
  id: 'rose-gold',
  name: 'Rose Gold',
  isDark: true,
  colors: {
    background: '#1a0f14',
    foreground: '#e2e8f0',
    card: '#26161d',
    cardForeground: '#e2e8f0',
    primary: '#ec4899',
    primaryForeground: '#ffffff',
    secondary: '#2d1a24',
    secondaryForeground: '#e2e8f0',
    muted: '#2d1a24',
    mutedForeground: '#94a3b8',
    accent: '#ec4899',
    accentForeground: '#ffffff',
    border: '#3a2030',
    input: '#3a2030',
    ring: '#ec4899',
    sidebar: '#140c10',
    sidebarForeground: '#e2e8f0',
    sidebarBorder: '#3a2030',
    sidebarAccent: '#26161d',
    sidebarAccentForeground: '#e2e8f0'
  }
},
{
  id: 'monochrome',
  name: 'Monochrome',
  isDark: true,
  colors: {
    background: '#000000',
    foreground: '#e2e8f0',
    card: '#111111',
    cardForeground: '#e2e8f0',
    primary: '#ffffff',
    primaryForeground: '#000000',
    secondary: '#1a1a1a',
    secondaryForeground: '#e2e8f0',
    muted: '#1a1a1a',
    mutedForeground: '#94a3b8',
    accent: '#ffffff',
    accentForeground: '#000000',
    border: '#2a2a2a',
    input: '#2a2a2a',
    ring: '#ffffff',
    sidebar: '#0a0a0a',
    sidebarForeground: '#e2e8f0',
    sidebarBorder: '#2a2a2a',
    sidebarAccent: '#1a1a1a',
    sidebarAccentForeground: '#e2e8f0'
  }
}];


interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: 'dark-nebula',
      setTheme: (id) => {
        set({ themeId: id });
        applyTheme(id);
      }
    }),
    {
      name: 'cmp-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.themeId);
      }
    }
  )
);

export function applyTheme(id: ThemeId) {
  const theme = themes.find((t) => t.id === id) || themes[0];
  const root = document.documentElement;

  root.setAttribute('data-theme', id);
  if (theme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const c = theme.colors;
  root.style.setProperty('--background', c.background);
  root.style.setProperty('--foreground', c.foreground);
  root.style.setProperty('--card', c.card);
  root.style.setProperty('--card-foreground', c.cardForeground);
  root.style.setProperty('--popover', c.card);
  root.style.setProperty('--popover-foreground', c.cardForeground);
  root.style.setProperty('--primary', c.primary);
  root.style.setProperty('--primary-foreground', c.primaryForeground);
  root.style.setProperty('--secondary', c.secondary);
  root.style.setProperty('--secondary-foreground', c.secondaryForeground);
  root.style.setProperty('--muted', c.muted);
  root.style.setProperty('--muted-foreground', c.mutedForeground);
  root.style.setProperty('--accent', c.accent);
  root.style.setProperty('--accent-foreground', c.accentForeground);
  root.style.setProperty('--border', c.border);
  root.style.setProperty('--input', c.input);
  root.style.setProperty('--ring', c.ring);
  root.style.setProperty('--sidebar', c.sidebar);
  root.style.setProperty('--sidebar-foreground', c.sidebarForeground);
  root.style.setProperty('--sidebar-border', c.sidebarBorder);
  root.style.setProperty('--sidebar-accent', c.sidebarAccent);
  root.style.setProperty('--sidebar-accent-foreground', c.sidebarAccentForeground);
  root.style.setProperty('--sidebar-primary', c.primary);
  root.style.setProperty('--sidebar-primary-foreground', c.primaryForeground);
  root.style.setProperty('--sidebar-ring', c.ring);
  root.style.setProperty('--destructive', '#ef4444');
  root.style.setProperty('--destructive-foreground', '#ef4444');
  root.style.setProperty('--chart-1', c.primary);
  root.style.setProperty('--chart-2', c.accent);
}