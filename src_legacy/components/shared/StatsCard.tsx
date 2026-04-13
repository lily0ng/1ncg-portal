import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  className?: string;
}
export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  delay = 0,
  className = ''
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(
    typeof value === 'number' ? 0 : value
  );
  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 1000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);
  return (
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
        duration: 0.4,
        delay
      }}
      whileHover={{
        y: -4,
        transition: {
          duration: 0.2
        }
      }}>
      
      <Card
        className={`overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all ${className}`}>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-3xl font-bold tracking-tight">
                  {displayValue}
                </h3>
                {trend &&
                <span
                  className={`text-xs font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  
                    {trend.isPositive ? '+' : '-'}
                    {Math.abs(trend.value)}%
                  </span>
                }
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>);

}