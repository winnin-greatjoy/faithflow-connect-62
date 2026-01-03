import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  FileText,
  ChevronRight,
  Layout,
  Users,
  Building2,
  Flag,
  Wand2,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const GeminiAIReportModule = () => {
  const navigate = useNavigate();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const sectors = [
    { id: 'general', label: 'General Branch Overview', icon: Layout },
    { id: 'membership', label: 'Membership Analytics', icon: Users },
    { id: 'departments', label: 'Departmental Performance', icon: Building2 },
    { id: 'ministries', label: 'Ministry Outreach', icon: Flag },
    { id: 'finance', label: 'Financial Health', icon: FileText },
  ];

  const toggleSector = (id: string) => {
    setSelectedSectors((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-primary/5 -ml-2 text-muted-foreground font-bold text-[10px] uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-foreground flex items-center gap-4">
            <Sparkles className="w-10 h-10 text-primary" />
            Gemini <span className="text-primary">AI Insights</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl font-medium">
            Advanced branch intelligence orchestrated by AI. Select components to synthesize a
            comprehensive operational report.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={selectedSectors.length === 0 || isGenerating}
          className="bg-vibrant-gradient h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Wand2 className="w-4 h-4 mr-3 animate-spin" />
              Synthesizing Data...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-3" />
              Generate Intelligence
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sector Selection */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="glass border-primary/5 overflow-hidden rounded-[2rem] shadow-xl">
            <CardHeader className="bg-primary/[0.02] border-b border-primary/5 p-8">
              <CardTitle className="text-xl font-serif">Component Selection</CardTitle>
              <CardDescription className="text-xs uppercase font-bold tracking-widest opacity-60">
                Select sectors to include in the AI synthesis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectors.map((sector) => (
                  <motion.div
                    key={sector.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSector(sector.id)}
                    className={cn(
                      'flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer group',
                      selectedSectors.includes(sector.id)
                        ? 'bg-primary/5 border-primary/20 shadow-lg'
                        : 'bg-white/40 dark:bg-black/20 border-transparent hover:border-primary/10'
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all',
                        selectedSectors.includes(sector.id)
                          ? 'bg-primary text-white scale-110'
                          : 'bg-primary/5 text-primary group-hover:bg-primary/10'
                      )}
                    >
                      <sector.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <Label className="font-bold text-sm cursor-pointer">{sector.label}</Label>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-40">
                        Include in synthesis
                      </p>
                    </div>
                    <Checkbox
                      checked={selectedSectors.includes(sector.id)}
                      onCheckedChange={() => toggleSector(sector.id)}
                      className="rounded-full border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="glass border-primary/5 overflow-hidden rounded-[2rem] shadow-xl bg-vibrant-gradient text-white">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <p className="text-sm font-medium opacity-90 leading-relaxed">
                Our Gemini-powered engine will analyze your branch data across all selected modules
                to provide:
              </p>
              <ul className="space-y-4">
                {[
                  'Growth trend predictions',
                  'Engagement bottlenecks',
                  'Financial efficiency metrics',
                  'Departmental synergies',
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-white/80"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-white opacity-40" />
                    {step}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full bg-white dark:bg-zinc-950 rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden glass border-primary/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-vibrant-gradient animate-pulse" />
              <Wand2 className="w-16 h-16 text-primary mx-auto mb-8 animate-bounce" />
              <h2 className="text-2xl font-serif font-black mb-4">Orchestrating Intelligence</h2>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                Gemini is analyzing thousands of data points across your branch sectors to
                synthesize your comprehensive report.
              </p>
              <div className="w-full bg-primary/5 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="bg-vibrant-gradient h-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
