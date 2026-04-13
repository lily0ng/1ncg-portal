import React from "react";
import { cn } from "../../../lib/utils";

interface CollapsibleContextType {
  open: boolean;
  toggle: () => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextType>({
  open: false,
  toggle: () => {}
});

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, open, defaultOpen = false, onOpenChange, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const controlledOpen = open !== undefined ? open : isOpen;

    const toggle = () => {
      const newOpen = !controlledOpen;
      if (open === undefined) setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    return (
      <CollapsibleContext.Provider value={{ open: controlledOpen, toggle }}>
        <div
          ref={ref}
          data-slot="collapsible"
          data-open={controlledOpen || undefined}
          className={cn(className)}
          {...props}>
          
          {children}
        </div>
      </CollapsibleContext.Provider>);

  }
);
Collapsible.displayName = "Collapsible";

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ className, ...props }, ref) => {
    const { toggle } = React.useContext(CollapsibleContext);

    return (
      <button
        ref={ref}
        type="button"
        data-slot="collapsible-trigger"
        onClick={toggle}
        className={cn(className)}
        {...props} />);


  }
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, ...props }, ref) => {
    const { open } = React.useContext(CollapsibleContext);
    if (!open) return null;

    return (
      <div
        ref={ref}
        data-slot="collapsible-content"
        className={cn(className)}
        {...props} />);


  }
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };