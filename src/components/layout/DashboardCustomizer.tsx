import React from 'react';
import { Settings2, Eye, EyeOff, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FEATURE_LIBRARY } from '@/modules/events/constants/eventModules';

interface DashboardCustomizerProps {
  activeModuleIds: string[];
  visibleModuleIds: string[];
  onVisibilityChange: (moduleId: string, visible: boolean) => void;
  onReset: () => void;
}

export function DashboardCustomizer({
  activeModuleIds,
  visibleModuleIds,
  onVisibilityChange,
  onReset,
}: DashboardCustomizerProps) {
  const activeModules = FEATURE_LIBRARY.filter((m) => activeModuleIds.includes(m.id));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-10 rounded-xl border-primary/10 bg-white shadow-lg hover:bg-primary/5"
        >
          <Settings2 className="h-5 w-5 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="font-serif font-black flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Dashboard Layout
          </DialogTitle>
          <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
            Customize your command center view
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4 mt-4">
          <div className="space-y-4">
            {activeModules.map((module) => {
              const isVisible = visibleModuleIds.includes(module.id);
              return (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-primary/5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <module.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{module.label}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {module.category}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={(checked) => onVisibilityChange(module.id, checked)}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6 flex gap-2">
          <Button
            variant="ghost"
            onClick={onReset}
            className="flex-1 rounded-xl font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Default
          </Button>
          <Button className="flex-1 rounded-xl font-black uppercase tracking-widest">
            <Save className="mr-2 h-4 w-4" />
            Save View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
