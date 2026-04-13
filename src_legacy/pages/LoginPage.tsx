import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cloud, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle } from
'../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useAuthStore } from '../store/authStore';
export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Simulate 10% chance of error for demo purposes
      if (Math.random() > 0.9) {
        setError(true);
      } else {
        login(role);
        navigate(role === 'admin' ? '/admin/dashboard' : '/portal/dashboard');
      }
    }, 1500);
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30"
        animate={{
          background: [
          'radial-gradient(circle at 0% 0%, var(--primary) 0%, transparent 50%)',
          'radial-gradient(circle at 100% 100%, var(--primary) 0%, transparent 50%)',
          'radial-gradient(circle at 0% 100%, var(--primary) 0%, transparent 50%)',
          'radial-gradient(circle at 100% 0%, var(--primary) 0%, transparent 50%)',
          'radial-gradient(circle at 0% 0%, var(--primary) 0%, transparent 50%)']

        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }} />
      

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50 dark:opacity-20" />

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.5
        }}
        className="z-10 w-full max-w-md px-4">
        
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.3)]"
            animate={{
              boxShadow: [
              '0 0 20px rgba(var(--primary),0.2)',
              '0 0 40px rgba(var(--primary),0.4)',
              '0 0 20px rgba(var(--primary),0.2)']

            }}
            transition={{
              duration: 3,
              repeat: Infinity
            }}>
            
            <Cloud className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            CloudStack CMP
          </h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <motion.div
          animate={
          error ?
          {
            x: [-10, 10, -10, 10, -5, 5, 0]
          } :
          {}
          }
          transition={{
            duration: 0.4
          }}>
          
          <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
            <Tabs
              defaultValue="admin"
              onValueChange={(v) => setRole(v as 'admin' | 'user')}>
              
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="user">User</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email or Username</Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder={
                      role === 'admin' ? 'admin' : 'user@company.com'
                      }
                      required
                      className="bg-background/50"
                      defaultValue={role === 'admin' ? 'admin' : 'user1'} />
                    
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="text-xs text-primary hover:underline">
                        
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        required
                        className="bg-background/50 pr-10"
                        defaultValue="password" />
                      
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        
                        {showPassword ?
                        <EyeOff className="h-4 w-4" /> :

                        <Eye className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>

                  {error &&
                  <p className="text-sm text-destructive font-medium">
                      Invalid credentials. Please try again.
                    </p>
                  }

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={isLoading}>
                    
                    {isLoading ?
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </> :

                    'Sign In'
                    }
                  </Button>
                </form>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} CloudStack Management Portal. All
          rights reserved.
        </p>
      </motion.div>
    </div>);

}