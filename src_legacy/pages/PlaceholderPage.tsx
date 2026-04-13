import React from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';
export function PlaceholderPage() {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  // Format title from path: /admin/compute/instances -> Instances
  const title =
  pathParts[pathParts.length - 1]?.
  split('-').
  map((word) => word.charAt(0).toUpperCase() + word.slice(1)).
  join(' ') || 'Page';
  const breadcrumbs = pathParts.map((part, index) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1),
    href:
    index < pathParts.length - 1 ?
    `/${pathParts.slice(0, index + 1).join('/')}` :
    undefined
  }));
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={`Manage your ${title.toLowerCase()}`}
        breadcrumbs={breadcrumbs} />
      

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        transition={{
          duration: 0.4
        }}>
        
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Construction className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Coming Soon
            </h2>
            <p className="text-muted-foreground max-w-md">
              The {title} page is currently under development. Please check back
              later for updates.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>);

}