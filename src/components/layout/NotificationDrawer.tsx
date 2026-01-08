import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle, CheckCircle, Info, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'alert' | 'success' | 'info' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'High Capacity Alert',
    message: 'Main Auditorium has reached 90% capacity.',
    timestamp: '2 mins ago',
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Deployment Complete',
    message: 'Safety Team Alpha has checked into Zone B.',
    timestamp: '15 mins ago',
    read: false,
  },
  {
    id: '3',
    type: 'message',
    title: 'New Staff Message',
    message: 'Sarah: Please verify the AV setup in the cafe.',
    timestamp: '1 hour ago',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'System Update',
    message: 'Attendance data synced successfully.',
    timestamp: '2 hours ago',
    read: true,
  },
];

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white shadow-2xl z-[70] border-l border-primary/5 flex flex-col"
          >
            <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-primary">Notifications</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">
                    System Alerts & Updates
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-xl hover:bg-white/50 text-primary"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {MOCK_NOTIFICATIONS.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer group',
                      notification.read
                        ? 'bg-white border-dashed border-gray-200 opacity-60 hover:opacity-100'
                        : 'bg-white border-primary/10 shadow-sm border-l-4 border-l-primary'
                    )}
                  >
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                          notification.type === 'alert'
                            ? 'bg-destructive/10 text-destructive'
                            : notification.type === 'success'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : notification.type === 'message'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-primary/10 text-primary'
                        )}
                      >
                        {notification.type === 'alert' && <AlertTriangle className="h-5 w-5" />}
                        {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
                        {notification.type === 'message' && <MessageSquare className="h-5 w-5" />}
                        {notification.type === 'info' && <Info className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={cn(
                              'text-sm font-bold',
                              !notification.read && 'text-primary'
                            )}
                          >
                            {notification.title}
                          </h4>
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {notification.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-primary/5 bg-muted/20">
              <Button
                variant="ghost"
                className="w-full text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
              >
                Mark all as read
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
