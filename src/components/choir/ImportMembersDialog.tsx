import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { parseMemberCSV, type MemberTemplateRow } from './utils/csvTemplates';
import { Upload, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export const ImportMembersDialog: React.FC<ImportMembersDialogProps> = ({
  open,
  onOpenChange,
  onImportComplete,
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<MemberTemplateRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    const { data, errors: parseErrors } = await parseMemberCSV(selectedFile);
    setParsedData(data);
    setErrors(parseErrors);

    if (data.length > 0) {
      setStep('preview');
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setImporting(true);
    try {
      // Get current user and branch
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('branch_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error('Could not load your profile');
      const branchId = (profile as any)?.branch_id;
      if (!branchId) throw new Error('Your profile is not assigned to a branch');

      // Prepare members for insertion
      const membersToInsert = parsedData.map((row) => ({
        full_name: row.fullName,
        email: row.email || null,
        phone: row.phone,
        date_of_birth: row.dateOfBirth,
        gender: row.gender,
        marital_status: row.maritalStatus,
        assigned_department: 'choir',
        date_joined: new Date().toISOString().split('T')[0],
        status: 'active' as const,
        branch_id: branchId,
        created_by: user.id,
        membership_level: 'convert' as const,
        area: '',
        community: '',
        street: '',
        public_landmark: '',
      }));

      const { error: insertError } = await supabase.from('members').insert(membersToInsert);

      if (insertError) throw insertError;

      toast({
        title: 'Import Successful',
        description: `Successfully imported ${parsedData.length} member(s)`,
      });

      onImportComplete();
      onOpenChange(false);
      resetState();
    } catch (err: any) {
      toast({
        title: 'Import Failed',
        description: err.message || 'Failed to import members',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setStep('upload');
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Import Choir Members</DialogTitle>
          <DialogDescription>
            Upload a CSV file with choir member information. Download the template first if you
            haven't already.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <div className="text-center">
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">CSV file up to 10MB</p>
                </div>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
            )}

            {errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Validation Errors</span>
                </div>
                <ScrollArea className="h-40 rounded-lg border border-red-200 bg-red-50 p-3">
                  <ul className="space-y-1 text-sm text-red-800">
                    {errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">{parsedData.length} member(s) ready to import</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep('upload')}>
                Upload Different File
              </Button>
            </div>

            {errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      {errors.length} row(s) skipped due to errors
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Fix errors in your CSV and re-upload to include these members
                    </p>
                  </div>
                </div>
              </div>
            )}

            <ScrollArea className="h-96 rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Phone</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Voice Part</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Experience</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {parsedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{row.fullName}</td>
                      <td className="px-4 py-2">{row.email || '-'}</td>
                      <td className="px-4 py-2">{row.phone}</td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className="capitalize">
                          {row.voicePart}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">{row.yearsExperience} yrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>
          {step === 'preview' && (
            <Button onClick={handleImport} disabled={importing || parsedData.length === 0}>
              {importing ? 'Importing...' : `Import ${parsedData.length} Member(s)`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
