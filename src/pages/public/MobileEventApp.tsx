import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, QrCode, MessageCircle, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AgendaView } from '@/modules/events/components/mobile/AgendaView';
import { DigitalBadge } from '@/modules/events/components/mobile/DigitalBadge';
import { InteractionHub } from '@/modules/events/components/mobile/InteractionHub';

// Placeholder components for tabs
const HomeView = () => (
  <div className="p-6 text-center text-muted-foreground">Home Feed Loading...</div>
);

export default function MobileEventApp() {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState<'home' | 'agenda' | 'badge' | 'interact'>('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'badge', icon: QrCode, label: 'Badge', isPrimary: true },
    { id: 'interact', icon: MessageCircle, label: 'Live' },
    { id: 'menu', icon: Menu, label: 'More' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto relative shadow-2xl border-x border-gray-100">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-14 flex items-center justify-between px-4 max-w-md mx-auto">
        <h1 className="font-serif font-bold text-lg text-primary">FaithFlow</h1>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
          JD
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16 px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="min-h-[80vh]"
          >
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'agenda' && <AgendaView />}
            {activeTab === 'badge' && <DigitalBadge />}
            {activeTab === 'interact' && <InteractionHub />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-2 safe-area-pb z-50 max-w-md mx-auto">
        {navItems.map((item) => (
          <div key={item.id} className="relative flex flex-col items-center">
            {item.isPrimary ? (
              <Button
                onClick={() => setActiveTab('badge' as any)}
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full -mt-8 shadow-xl shadow-primary/30 border-4 border-gray-50 transition-transform active:scale-95"
              >
                <item.icon className="h-6 w-6 text-white" />
              </Button>
            ) : (
              <Button
                onClick={() => item.id !== 'menu' && setActiveTab(item.id as any)}
                variant="ghost"
                className={cn(
                  'flex flex-col items-center gap-1 h-auto py-2 hover:bg-transparent',
                  activeTab === item.id ? 'text-primary' : 'text-muted-foreground/60'
                )}
              >
                <item.icon
                  className={cn('h-6 w-6 transition-all', activeTab === item.id ? 'scale-110' : '')}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Button>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
