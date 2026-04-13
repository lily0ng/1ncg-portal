import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { mockMarketplaceApps } from '../../lib/mockData';
import { Search, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
export function UserStorePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = [
  'All',
  ...new Set(mockMarketplaceApps.map((a) => a.category))];

  const filtered = mockMarketplaceApps.filter((app) => {
    const matchesSearch =
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
    selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return (
    <div className="space-y-6">
      <PageHeader
        title="App Store"
        description="Deploy pre-configured applications with one click." />
      

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8" />
          
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) =>
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}>
            
              {cat}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((app, index) =>
        <motion.div
          key={app.id}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.05
          }}
          whileHover={{
            y: -4
          }}>
          
            <Card className="h-full flex flex-col border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{app.icon}</span>
                  <Badge variant="secondary" className="text-xs">
                    {app.category}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{app.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {app.description}
                </p>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {app.price === 0 ?
                <span className="text-green-500">Free</span> :

                `$${app.price.toFixed(2)}/mo`
                }
                </span>
                <Button
                size="sm"
                onClick={() => toast.success(`Deploying ${app.name}...`)}>
                
                  <Rocket className="mr-2 h-3.5 w-3.5" />
                  Deploy
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </div>

      {filtered.length === 0 &&
      <div className="text-center py-12 text-muted-foreground">
          No apps found matching your search.
        </div>
      }
    </div>);

}