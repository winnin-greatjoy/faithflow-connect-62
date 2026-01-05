import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConvertForm, ConvertFormData } from '@/components/admin/ConvertForm';
import type { Member } from '@/types/membership';

interface ConvertFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  convert?: Partial<Member> | null;
  branches: { id: string; name: string }[];
  onSubmit: (data: ConvertFormData) => void;
}

export const ConvertFormDialog: React.FC<ConvertFormDialogProps> = ({
  open,
  onOpenChange,
  convert,
  branches,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent
            key="convert-dialog-content"
            className="max-w-2xl bg-transparent border-none shadow-none p-0 overflow-visible max-h-[95vh] overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-primary/10 rounded-[32px] overflow-hidden shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

              <div className="p-8">
                <DialogHeader className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-md">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <DialogTitle className="text-2xl font-serif font-black text-foreground">
                          {convert ? 'Refine Convert' : 'Initialize Conversion'}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                          Soul Winning Digital Protocol
                        </DialogDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenChange(false)}
                      className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </DialogHeader>

                <ConvertForm
                  convert={convert}
                  branches={branches}
                  onSubmit={onSubmit}
                  onCancel={() => onOpenChange(false)}
                />
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
