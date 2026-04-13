import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'../ui/DropdownMenu';
import { Button } from '../ui/Button';
import { Palette, Check } from 'lucide-react';
import { useThemeStore, themes } from '../../store/themeStore';
export function ThemeSwitcher() {
  const { themeId, setTheme } = useThemeStore();
  const currentTheme = themes.find((t) => t.id === themeId) || themes[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((theme) =>
        <DropdownMenuItem
          key={theme.id}
          onClick={() => setTheme(theme.id)}
          className="flex items-center justify-between cursor-pointer">
          
            <div className="flex items-center gap-2">
              <div
              className="w-4 h-4 rounded-full border shadow-sm"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.primary
              }} />
            
              <span>{theme.name}</span>
            </div>
            {themeId === theme.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>);

}