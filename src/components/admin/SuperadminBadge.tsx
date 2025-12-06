import React from 'react';
import { Shield, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SuperadminBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * Badge component to visually indicate superadmin status
 * Shows a premium-styled badge with tooltip explaining elevated privileges
 */
export const SuperadminBadge: React.FC<SuperadminBadgeProps> = ({
  variant = 'full',
  className,
}) => {
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'inline-flex items-center justify-center w-6 h-6 rounded-full',
                'bg-gradient-to-br from-amber-400 to-amber-600',
                'shadow-md hover:shadow-lg transition-shadow',
                className
              )}
            >
              <Crown className="h-3.5 w-3.5 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-semibold">System Administrator</p>
            <p className="text-xs text-muted-foreground mt-1">
              Full system access across all branches and modules
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1',
              'bg-gradient-to-r from-amber-500 to-amber-600',
              'text-white border-amber-700',
              'shadow-md hover:shadow-lg transition-all',
              'cursor-help',
              className
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">SUPERADMIN</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              System Administrator
            </p>
            <p className="text-xs text-muted-foreground">You have elevated privileges including:</p>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
              <li>Access to all church branches</li>
              <li>Global role management</li>
              <li>System configuration</li>
              <li>Audit log access</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
