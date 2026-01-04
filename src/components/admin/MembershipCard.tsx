import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, Share2, MapPin, Phone, Mail, Calendar, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';

interface MembershipCardProps {
  member: any;
  branchName: string;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ member, branchName }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      scale: 2,
      backgroundColor: null,
    });
    const link = document.createElement('a');
    link.download = `Membership_Card_${member.full_name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const verificationUrl = `${window.location.origin}/verify/member/${member.id}`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={cardRef}
        className="relative w-[400px] h-[250px] rounded-[2rem] overflow-hidden shadow-2xl bg-[#0f172a] text-white p-6 font-sans group"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        {/* Abstract Background Ornaments */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
        <div className="absolute -bottom-20 -left-10 w-52 h-52 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700" />

        {/* Card Header Branding */}
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-vibrant-gradient flex items-center justify-center p-1.5 shadow-lg">
              <Zap className="text-white fill-white h-full w-full" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none opacity-80">
                FaithFlow Connect
              </h3>
              <p className="text-[8px] font-bold uppercase tracking-widest text-primary/80 mt-1">
                {branchName}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-white/5 text-white/60 border-none text-[8px] font-black uppercase tracking-widest px-2 h-5"
          >
            Member ID Card
          </Badge>
        </div>

        <div className="flex gap-6 mt-4 relative z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-white/10 p-0.5 rounded-2xl shadow-xl">
                <AvatarImage
                  src={member.profile_photo || ''}
                  className="rounded-2xl object-cover"
                />
                <AvatarFallback className="bg-slate-800 text-white rounded-2xl text-xl font-black">
                  {member.full_name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-4 border-[#121c31]">
                <ShieldCheck className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="bg-white p-1 rounded-lg">
              <QRCodeSVG value={verificationUrl} size={42} level="H" includeMargin={false} />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-lg font-serif font-black tracking-tight leading-none truncate w-[220px]">
                {member.full_name}
              </h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                {member.membership_level || 'Member'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <div className="flex items-center gap-2 text-[10px] opacity-70">
                <Zap className="h-3 w-3 text-primary" />
                <span className="font-bold tracking-tight">
                  ID: {member.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] opacity-70">
                <Calendar className="h-3 w-3 text-primary" />
                <span className="font-bold tracking-tight">
                  Joined:{' '}
                  {member.date_joined ? format(new Date(member.date_joined), 'MMM yyyy') : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 mt-2">
              <div className="flex items-center gap-2 text-[8px] opacity-40 font-black uppercase tracking-[0.15em]">
                Official Verified Persona
              </div>
            </div>
          </div>
        </div>

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleDownload}
          className="rounded-xl h-10 px-6 font-bold text-xs bg-vibrant-gradient border-none lg:hover:scale-105 transition-transform shadow-lg shadow-primary/20"
        >
          <Download className="mr-2 h-4 w-4" /> Download Digital ID
        </Button>
      </div>
    </div>
  );
};
