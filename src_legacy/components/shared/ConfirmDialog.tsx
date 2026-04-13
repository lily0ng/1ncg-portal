import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'../ui/Dialog';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
}
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <AnimatePresence>
          {open &&
          <motion.div
            initial={
            variant === 'danger' ?
            {
              x: -10
            } :
            {
              opacity: 0
            }
            }
            animate={
            variant === 'danger' ?
            {
              x: [0, -10, 10, -10, 10, 0]
            } :
            {
              opacity: 1
            }
            }
            transition={{
              duration: 0.4
            }}>
            
              <DialogHeader>
                <DialogTitle
                className={variant === 'danger' ? 'text-destructive' : ''}>
                
                  {title}
                </DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {cancelLabel}
                </Button>
                <Button
                variant={variant === 'danger' ? 'destructive' : 'default'}
                onClick={handleConfirm}>
                
                  {confirmLabel}
                </Button>
              </DialogFooter>
            </motion.div>
          }
        </AnimatePresence>
      </DialogContent>
    </Dialog>);

}