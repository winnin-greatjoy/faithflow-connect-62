import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldCheck, Download, Mail, Phone, MapPin, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

interface MembershipCardProps {
  member: any;
  branchName: string;
  districtName?: string;
  departments?: string[];
}

export const MembershipCard: React.FC<MembershipCardProps> = ({
  member,
  branchName,
  districtName = 'Main District',
  departments = [],
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    // Snapshot Bridge: Temporarily force fixed dimensions for high-quality portrait capture
    const originalWidth = cardRef.current.style.width;
    const originalHeight = cardRef.current.style.height;
    const originalAspect = cardRef.current.style.aspectRatio;

    cardRef.current.style.width = '800px';
    cardRef.current.style.height = '1100px';
    cardRef.current.style.aspectRatio = 'auto';

    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `Portrait_ID_Card_${member.full_name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Failed to generate card image', err);
    } finally {
      cardRef.current.style.width = originalWidth;
      cardRef.current.style.height = originalHeight;
      cardRef.current.style.aspectRatio = originalAspect;
    }
  };

  const verificationUrl = `${window.location.origin}/verify/member/${member.id}`;

  const districtPrefix = districtName.substring(0, 3).toUpperCase();
  const branchPrefix = branchName.substring(0, 3).toUpperCase();
  const shortId = (member.id || '00000000').substring(0, 8).toUpperCase();
  const formattedId = `${districtPrefix}-${branchPrefix}-${shortId}`;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-[400px] mx-auto">
      {/* Vertical ID Card Container */}
      <div
        ref={cardRef}
        className="relative w-full aspect-[3/4.2] bg-white text-slate-900 overflow-hidden shadow-2xl rounded-2xl font-sans flex flex-col items-center border border-slate-100"
      >
        {/* Geometric Header (Blue Chevron) */}
        <div
          className="absolute top-0 left-0 w-full h-[40%] bg-[#1e88e5] flex flex-col items-center pt-8 px-4"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
          }}
        >
          <span className="text-white font-black text-sm tracking-[0.3em] uppercase opacity-90">
            FaithFlow Connect
          </span>
          <div className="flex items-center gap-1.5 mt-2 opacity-60">
            <Building2 className="w-3 h-3 text-white" />
            <p className="text-white text-[9px] font-bold uppercase tracking-widest">
              {branchName} • {districtName}
            </p>
          </div>
        </div>

        {/* Lower Chevron (Footer) */}
        <div
          className="absolute bottom-0 left-0 w-full h-[12%] bg-[#1a1a1a]"
          style={{
            clipPath: 'polygon(0 25%, 50% 0, 100% 25%, 100% 100%, 0 100%)',
          }}
        />

        {/* Content Overlay */}
        <div className="relative z-10 w-full flex flex-col items-center pt-[22%] h-full pb-8">
          {/* Square Avatar Container */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            {/* Outer Square Border */}
            <div className="absolute inset-0 bg-white rounded-2xl shadow-md border border-slate-100" />
            {/* Profile Photo Square */}
            <div className="absolute inset-2 overflow-hidden bg-slate-200 rounded-xl border border-slate-50">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage
                  src={member.profile_photo || member.profilePhoto || ''}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <AvatarFallback className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500 text-4xl font-black rounded-none">
                  {member.full_name?.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Name and Designation */}
          <div className="mt-6 flex flex-col items-center px-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#1a1a1a] uppercase tracking-tighter text-center leading-tight">
              {member.full_name}
            </h2>
            <span className="text-[10px] sm:text-[12px] font-bold text-[#1e88e5] uppercase tracking-[0.2em] mt-1 italic">
              {member.membership_level || 'MEMBER'}
            </span>

            {/* Horizontal Line with Dots */}
            <div className="mt-4 w-32 h-[2px] bg-slate-200 relative flex justify-center items-center">
              <div className="flex gap-1 bg-white px-2">
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="w-1 h-1 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>

          {/* Details List (Aligned like sample) */}
          <div className="mt-6 w-full px-8 sm:px-12 space-y-2 sm:space-y-3">
            <div className="flex items-baseline">
              <span className="w-20 text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ID No
              </span>
              <span className="mr-2 text-slate-400">:</span>
              <span className="text-[10px] sm:text-[12px] font-mono font-bold text-slate-800">
                {formattedId}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-20 text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Phone
              </span>
              <span className="mr-2 text-slate-400">:</span>
              <span className="text-[10px] sm:text-[12px] font-bold text-slate-800">
                {member.phone || 'N/A'}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-20 text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Email
              </span>
              <span className="mr-2 text-slate-400">:</span>
              <span className="text-[9px] sm:text-[11px] font-bold text-slate-800 truncate flex-1">
                {member.email || 'N/A'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-20 text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">
                Unit(s)
              </span>
              <span className="mr-2 text-slate-400">:</span>
              <div className="flex flex-wrap gap-1">
                {departments && departments.length > 0 ? (
                  departments.map((dept, i) => (
                    <span
                      key={i}
                      className="text-[8px] sm:text-[10px] font-black text-[#1e88e5] uppercase px-1.5 py-0.5 rounded-sm bg-blue-50 border border-blue-100 italic"
                    >
                      @{dept.replace(/\s+/g, '').toLowerCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] font-medium text-slate-300">No assigned units</span>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Watermark (Bottom Left Relative) */}
          <div className="mt-auto mb-2 flex flex-col items-center opacity-30">
            <QRCodeSVG value={verificationUrl} size={32} />
            <span className="text-[6px] font-black uppercase tracking-tighter mt-1">
              SECURED ID
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full">
        <Button
          onClick={handleDownload}
          className="w-full bg-[#1e88e5] hover:bg-[#1976d2] text-white font-black h-14 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 transition-all"
        >
          <Download className="h-5 w-5" />
          Download ID Card
        </Button>
        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest px-4">
          Digital Membership Identity • Portrait High-Res Capture
        </p>
      </div>
    </div>
  );
};

export default MembershipCard;
