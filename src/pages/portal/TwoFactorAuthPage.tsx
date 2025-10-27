import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

export const TwoFactorAuthPage: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const { toast } = useToast();

  const handleEnable2FA = () => {
    toast({
      title: '2FA Enabled',
      description: 'Two-factor authentication has been enabled for your account',
    });
    setIsEnabled(true);
  };

  const handleDisable2FA = () => {
    toast({
      title: '2FA Disabled',
      description: 'Two-factor authentication has been disabled',
    });
    setIsEnabled(false);
  };

  const handleVerify = () => {
    toast({
      title: 'Code Verified',
      description: 'Your verification code has been confirmed',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Two-Factor Authentication</h1>
        <p className="text-muted-foreground mt-2">Add an extra layer of security to your account</p>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription>
          Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>
                {isEnabled ? 'Two-factor authentication is currently enabled' : 'Two-factor authentication is currently disabled'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isEnabled} onCheckedChange={isEnabled ? handleDisable2FA : handleEnable2FA} />
              {isEnabled ? (
                <ShieldCheck className="h-5 w-5 text-success" />
              ) : (
                <ShieldOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        {!isEnabled && (
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Setup Instructions
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Scan the QR code below with your authenticator app</li>
                <li>Enter the 6-digit code from your app to verify</li>
              </ol>
            </div>

            <div className="flex justify-center p-6 bg-muted/50 rounded-lg">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-border">
                <p className="text-xs text-muted-foreground text-center px-4">
                  QR Code will appear here when setting up
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <div className="flex gap-2">
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                <Button onClick={handleVerify} disabled={verificationCode.length !== 6}>
                  Verify
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Recovery Codes</CardTitle>
            <CardDescription>
              Save these codes in a safe place. You can use them to access your account if you lose your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {['XXXX-XXXX', 'YYYY-YYYY', 'ZZZZ-ZZZZ', 'AAAA-AAAA', 'BBBB-BBBB', 'CCCC-CCCC'].map((code, i) => (
                <div key={i} className="p-2 bg-background rounded">{code}</div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full">
              Download Recovery Codes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TwoFactorAuthPage;
