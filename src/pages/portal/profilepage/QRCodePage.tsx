import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import { useRef } from 'react';
import html2canvas from 'html2canvas';

export const QRCodePage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);

  const verificationUrl = user ? `${window.location.origin}/verify/member/${user.id}` : '';

  const handleDownload = async () => {
    if (!qrRef.current) return;
    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `My_QR_Code.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'QR Code downloaded successfully' });
    } catch (error) {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'My FaithFlow QR Code',
          text: 'Verify my membership or check into events using this QR code.',
          url: verificationUrl,
        })
        .catch(() => {});
    } else {
      toast({ title: 'Sharing not supported on this browser' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Code</h1>
        <p className="text-muted-foreground mt-2">Your personal QR code for quick check-ins</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal QR Code</CardTitle>
          <CardDescription>
            Use this QR code for event check-ins and attendance tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border-2 border-primary/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-vibrant-gradient opacity-[0.03]" />
            <div ref={qrRef} className="relative z-10 bg-white p-4 rounded-xl">
              {user ? (
                <QRCodeSVG
                  value={verificationUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: '/favicon.ico',
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              ) : (
                <div className="w-48 h-48 bg-muted animate-pulse rounded-lg" />
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center max-w-md">
            <p>
              Show this QR code at events to quickly check in. Keep it accessible on your device.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodePage;
