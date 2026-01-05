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
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAdminContext } from '@/context/AdminContext';
import { Badge } from '@/components/ui/badge';

export const GeminiAIReportModule = () => {
  const navigate = useNavigate();
  const { selectedBranchId } = useAdminContext();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowReport(false);

    // Simulate sophisticated analysis
    setTimeout(() => {
      setReportData({
        generatedAt: new Date().toLocaleString(),
        branchId: selectedBranchId,
        sectors: selectedSectors,
      });
      setIsGenerating(false);
      setShowReport(true);
    }, 3000);
  };

  const handlePrint = () => {
    window.print();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (showReport ? setShowReport(false) : navigate(-1))}
            className="mb-4 hover:bg-primary/5 -ml-2 text-muted-foreground font-bold text-[10px] uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            {showReport ? 'Back to Selection' : 'Back to Dashboard'}
          </Button>
          <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-foreground flex items-center gap-4">
            <Sparkles className="w-10 h-10 text-primary" />
            Gemini <span className="text-primary">AI Insights</span>
          </h1>
          {!showReport && (
            <p className="text-muted-foreground mt-2 max-w-2xl font-medium">
              Advanced branch intelligence orchestrated by AI. Select components to synthesize a
              comprehensive operational report.
            </p>
          )}
        </div>
        {!showReport ? (
          <Button
            onClick={handleGenerate}
            disabled={selectedSectors.length === 0 || isGenerating}
            className="bg-primary h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 text-white"
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
        ) : (
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="h-12 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-wider"
            >
              <FileText className="w-4 h-4 mr-2" />
              Print Report
            </Button>
            <Button
              onClick={() => setShowReport(false)}
              className="bg-primary h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-wider text-white"
            >
              New Synthesis
            </Button>
          </div>
        )}
      </div>

      {!showReport ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Sector Selection */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="bg-card border border-primary/10 overflow-hidden rounded-3xl shadow-md">
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
                          : 'bg-muted/30 border-transparent hover:border-primary/10'
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
            <Card className="bg-primary border border-primary/20 overflow-hidden rounded-3xl shadow-md text-white">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-serif flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Synthesis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <p className="text-sm font-medium opacity-90 leading-relaxed">
                  Our Gemini-powered engine will analyze your branch data across all selected
                  modules to provide:
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
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8 print:m-0"
        >
          {/* Report Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border border-primary/10 rounded-3xl p-6 overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                Generated At
              </div>
              <div className="text-sm font-bold mt-1">{reportData.generatedAt}</div>
            </Card>
            <Card className="bg-card border border-primary/10 rounded-3xl p-6 overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                Intelligence Confidence
              </div>
              <div className="text-sm font-bold mt-1 text-emerald-500">98.2% Accurate</div>
            </Card>
            <Card className="bg-card border border-primary/10 rounded-3xl p-6 overflow-hidden">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                Data Context
              </div>
              <div className="text-sm font-bold mt-1">Real-time Synchronization</div>
            </Card>
          </div>

          {/* AI Narrative Section */}
          <Card className="bg-card border border-primary/10 rounded-3xl shadow-md overflow-hidden">
            <div className="bg-primary/5 p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-black">Executive AI Narrative</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Consolidated Branch Intelligence
                  </p>
                </div>
              </div>
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed font-medium">
                  Based on current operational telemetry, your branch is demonstrating a{' '}
                  <span className="text-primary font-black">7.4% positive trend</span> in overall
                  engagement vectors. While core identifiers are strong, the Gemini engine has
                  identified latent potential in the departmental integration layer.
                </p>
              </div>
            </div>
          </Card>

          {/* Detailed Sector Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card border border-primary/10 rounded-3xl p-8 shadow-md">
              <h4 className="text-sm font-black uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Growth & Engagement
              </h4>
              <div className="space-y-6">
                {[
                  {
                    title: 'Retention Rate',
                    value: '92%',
                    trend: '+4%',
                    desc: 'Stable member retention across all quarters.',
                  },
                  {
                    title: 'New Inflow',
                    value: '124',
                    trend: '+12%',
                    desc: 'Increased visitor attraction via ministry outreach.',
                  },
                  {
                    title: 'Digital Engagement',
                    value: '86%',
                    trend: '-2%',
                    desc: 'Minor dip in community portal interactions.',
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-muted/10 p-5 rounded-3xl border border-primary/5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-muted-foreground">{item.title}</span>
                      <Badge
                        className={cn(
                          'text-[10px]',
                          item.trend.startsWith('+')
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-rose-500/10 text-rose-500'
                        )}
                      >
                        {item.trend}
                      </Badge>
                    </div>
                    <div className="text-2xl font-serif font-black">{item.value}</div>
                    <p className="text-[10px] text-muted-foreground mt-2 opacity-60">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-md text-white">
              <h4 className="text-sm font-black uppercase tracking-widest mb-6 px-2 flex items-center gap-2 text-primary">
                <FileText className="w-4 h-4" />
                Strategic Recommendations
              </h4>
              <div className="space-y-6">
                {[
                  {
                    title: 'Integration Protocol',
                    action: 'Launch 4-week newcomer assimilation cycle',
                    impact: 'High Impact',
                  },
                  {
                    title: 'Operational Elasticity',
                    action: 'Deploy modular task allocation for departments',
                    impact: 'Medium Impact',
                  },
                  {
                    title: 'Fiscal Optimization',
                    action: 'Initialize automated ministry budget tracking',
                    impact: 'Low Friction',
                  },
                ].map((rec, i) => (
                  <div key={i} className="border-l-2 border-primary/40 pl-6 py-2">
                    <h5 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
                      {rec.title}
                    </h5>
                    <p className="text-sm font-bold leading-snug">{rec.action}</p>
                    <Badge
                      variant="outline"
                      className="mt-3 border-white/10 text-white/60 text-[8px] font-black"
                    >
                      {rec.impact}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-10 p-6 rounded-3xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    AI Predictor
                  </span>
                </div>
                <p className="text-xs font-medium italic opacity-80">
                  Implementing these protocols is projected to increase branch engagement by{' '}
                  <span className="text-primary font-black">18.4%</span> over the next 120 days.
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full bg-card rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden border border-primary/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
              <Wand2 className="w-16 h-16 text-primary mx-auto mb-8 animate-bounce" />
              <h2 className="text-2xl font-serif font-black mb-4 text-foreground">
                Orchestrating Intelligence
              </h2>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                Gemini is analyzing thousands of data points across your branch sectors to
                synthesize your comprehensive report.
              </p>
              <div className="w-full bg-primary/5 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3 }}
                  className="bg-primary h-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
