import React from 'react';
import {
  Server,
  HardDrive,
  CreditCard,
  Activity,
  Play,
  Square,
  RotateCcw,
  Terminal } from
'lucide-react';
import { StatsCard } from '../shared/StatsCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle } from
'../ui/Card';
import { Button } from '../ui/Button';
import { mockVMs, mockVolumes } from '../../lib/mockData';
import { StatusBadge } from '../shared/StatusBadge';
import { motion } from 'framer-motion';
export function UserDashboard() {
  // Filter for user1
  const userVMs = mockVMs.filter((vm) => vm.account === 'user1');
  const runningVMs = userVMs.filter((vm) => vm.state === 'Running').length;
  const userVolumes = mockVolumes.filter((vol) => vol.account === 'user1');
  const totalStorage = userVolumes.reduce((acc, vol) => acc + vol.size, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, User
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your resources.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Deploy Instance
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="My Instances"
          value={userVMs.length}
          icon={Server}
          delay={0.1} />
        
        <StatsCard
          title="Running"
          value={runningVMs}
          icon={Activity}
          delay={0.2} />
        
        <StatsCard
          title="Storage Used"
          value={`${totalStorage} GB`}
          icon={HardDrive}
          delay={0.3} />
        
        <StatsCard
          title="This Month Cost"
          value="185,500 MMK"
          icon={CreditCard}
          delay={0.4} />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - VM List */}
        <Card className="col-span-1 lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Instances</CardTitle>
              <CardDescription>
                Quick overview of your virtual machines
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userVMs.map((vm, index) =>
              <motion.div
                key={vm.id}
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: index * 0.1
                }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div
                    className={`p-2 rounded-full ${vm.state === 'Running' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{vm.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>{vm.ipaddress}</span>
                        <span>•</span>
                        <span>{vm.zonename}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <StatusBadge status={vm.state} />
                    <div className="flex gap-1">
                      {vm.state === 'Running' ?
                    <Button variant="ghost" size="icon" title="Stop">
                          <Square className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                        </Button> :

                    <Button variant="ghost" size="icon" title="Start">
                          <Play className="h-4 w-4 text-muted-foreground hover:text-green-500" />
                        </Button>
                    }
                      <Button
                      variant="ghost"
                      size="icon"
                      title="Reboot"
                      disabled={vm.state !== 'Running'}>
                      
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                      variant="ghost"
                      size="icon"
                      title="Console"
                      disabled={vm.state !== 'Running'}>
                      
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {userVMs.length === 0 &&
              <div className="text-center py-8 text-muted-foreground">
                  You don't have any instances yet.
                </div>
              }
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Resource Limits</CardTitle>
              <CardDescription>Your account quotas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Instances</span>
                  <span className="text-muted-foreground">
                    {userVMs.length} / 10
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${userVMs.length / 10 * 100}%`
                    }}>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Storage</span>
                  <span className="text-muted-foreground">
                    {totalStorage} GB / 500 GB
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${totalStorage / 500 * 100}%`
                    }}>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Public IPs</span>
                  <span className="text-muted-foreground">1 / 5</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: '20%'
                    }}>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-500">
                Need more resources?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upgrade your account to increase your resource limits and access
                premium features.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

}