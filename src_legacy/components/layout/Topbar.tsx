import React, { Fragment } from 'react';
import {
  Menu,
  Search,
  Bell,
  User as UserIcon,
  Settings,
  LogOut } from
'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
'../ui/DropdownMenu';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
interface TopbarProps {
  onMenuClick: () => void;
  breadcrumbs?: string[];
}
export function Topbar({ onMenuClick, breadcrumbs = [] }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-3">
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={onMenuClick}>
        
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="hidden sm:flex items-center text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) =>
        <Fragment key={i}>
            {i > 0 && <span className="mx-2">/</span>}
            <span
            className={
            i === breadcrumbs.length - 1 ?
            'text-foreground font-medium' :
            ''
            }>
            
              {crumb}
            </span>
          </Fragment>
        )}
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources... (⌘K)"
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]" />
          
        </div>

        <ThemeSwitcher />

        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.username}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive">
              
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>);

}