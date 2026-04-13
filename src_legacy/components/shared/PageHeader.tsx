import React, { Fragment } from 'react';
import { motion } from 'framer-motion';
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
  children?: React.ReactNode;
}
export function PageHeader({
  title,
  description,
  breadcrumbs,
  children
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      
      <div>
        {breadcrumbs && breadcrumbs.length > 0 &&
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
            {breadcrumbs.map((crumb, i) =>
          <Fragment key={i}>
                {i > 0 && <span className="mx-2">/</span>}
                {crumb.href ?
            <a
              href={crumb.href}
              className="hover:text-foreground transition-colors">
              
                    {crumb.label}
                  </a> :

            <span className="text-foreground font-medium">
                    {crumb.label}
                  </span>
            }
              </Fragment>
          )}
          </nav>
        }
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description &&
        <p className="text-muted-foreground mt-1">{description}</p>
        }
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </motion.div>);

}