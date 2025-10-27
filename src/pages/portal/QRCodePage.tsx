import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const QRCodePage: React.FC = () => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({ title: 'QR Code downloaded successfully' });
  };

  const handleShare = () => {
    toast({ title: 'Share functionality coming soon' });
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
          <div className="bg-white p-8 rounded-lg border-2 border-border">
            <div className="w-64 h-64 bg-muted flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center">
                QR Code will be generated here
              </p>
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
            <p>Show this QR code at events to quickly check in. Keep it accessible on your device.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodePage;
