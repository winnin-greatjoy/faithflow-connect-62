import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, FileUp, Check, AlertCircle, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportedMember {
  full_name: string;
  email?: string;
  phone: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female';
  marital_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  street?: string;
  area?: string;
  community?: string;
  status?: 'active' | 'inactive' | 'archived';
  date_joined?: string;
  [key: string]: any;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface BulkMemberImportProps {
  onSuccess: () => void;
  branchId: string;
}

export const BulkMemberImport: React.FC<BulkMemberImportProps> = ({ onSuccess, branchId }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportedMember[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            validateData(results.data as ImportedMember[]);
          },
          error: (error) => {
            toast({
              title: 'Error parsing CSV',
              description: error.message,
              variant: 'destructive',
            });
          },
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as ImportedMember[];
        validateData(jsonData);
      }
    };

    if (file.name.endsWith('.csv')) {
      // Papa parse handles the file directly
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          validateData(results.data as ImportedMember[]);
        },
        error: (error) => {
          toast({
            title: 'Error parsing CSV',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const validateData = (data: ImportedMember[]) => {
    const errors: ValidationError[] = [];
    const validData: ImportedMember[] = [];

    data.forEach((row, index) => {
      const rowErrors: ValidationError[] = [];

      if (!row.full_name) {
        rowErrors.push({ row: index + 1, field: 'full_name', message: 'Full Name is required' });
      }

      if (!row.phone) {
        rowErrors.push({ row: index + 1, field: 'phone', message: 'Phone is required' });
      }

      // Basic date validation
      if (row.date_of_birth && isNaN(Date.parse(row.date_of_birth))) {
        rowErrors.push({
          row: index + 1,
          field: 'date_of_birth',
          message: 'Invalid Date of Birth',
        });
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        // Normalize data
        validData.push({
          ...row,
          status: (row.status?.toLowerCase() as any) || 'active',
          date_joined: row.date_joined || new Date().toISOString().split('T')[0],
          street: row.street || 'Unknown',
          area: row.area || 'Unknown',
          community: row.community || 'Unknown',
          gender: row.gender || 'Male', // Default or handle better
          marital_status: row.marital_status || 'Single',
          membership_level: 'Member', // Default
        });
      }
    });

    setParsedData(validData);
    setValidationErrors(errors);
    setStep('preview');
  };

  const handleImport = async () => {
    setIsUploading(true);
    setStep('importing');
    let successCount = 0;
    let failedCount = 0;

    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < parsedData.length; i += batchSize) {
      const batch = parsedData.slice(i, i + batchSize).map((member) => {
        // Normalize gender to lowercase
        const normalizedGender = member.gender
          ? (member.gender.toLowerCase() as 'male' | 'female')
          : 'male';

        return {
          full_name: member.full_name,
          email: member.email || null,
          phone: member.phone,
          date_of_birth: member.date_of_birth || '1990-01-01',
          gender: normalizedGender,
          marital_status: member.marital_status?.toLowerCase() || null,
          street: member.street || null,
          area: member.area || '',
          community: member.community || '',
          branch_id: branchId,
          created_by: supabase.auth.getUser() as unknown as string,
          membership_level: 'member' as const,
          date_joined: member.date_joined || new Date().toISOString().split('T')[0],
          status: (member.status as 'active' | 'inactive' | 'archived') || 'active',
        };
      });

      const { error } = await supabase.from('members').insert(batch as any);

      if (error) {
        console.error('Batch import error:', error);
        failedCount += batch.length;
        toast({
          title: 'Batch Import Failed',
          description: `Failed to import rows ${i + 1} to ${i + batch.length}: ${error.message}`,
          variant: 'destructive',
        });
      } else {
        successCount += batch.length;
      }
    }

    setImportStats({ success: successCount, failed: failedCount });
    setIsUploading(false);
    setStep('complete');

    if (successCount > 0) {
      toast({
        title: 'Import Complete',
        description: `Successfully imported ${successCount} members.`,
      });
      onSuccess();
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'full_name',
      'email',
      'phone',
      'date_of_birth',
      'gender',
      'marital_status',
      'street',
      'area',
      'community',
      'date_joined',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'member_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {step === 'upload' && (
        <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg bg-gray-50">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Member List</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Support CSV or Excel files. <br />
            Make sure your file includes required fields: Full Name, Phone.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <FileUp className="w-4 h-4 mr-2" />
              Select File
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
          />
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Preview Data</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={parsedData.length === 0}>
                Import {parsedData.length} Members
              </Button>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                Found {validationErrors.length} errors. These rows will be skipped.
              </AlertDescription>
            </Alert>
          )}

          <ScrollArea className="h-[400px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.slice(0, 100).map((member, i) => (
                  <TableRow key={i}>
                    <TableCell>{member.full_name}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <p className="text-xs text-muted-foreground text-center">
            Showing first 100 rows of {parsedData.length} valid records.
          </p>
        </div>
      )}

      {step === 'importing' && (
        <div className="flex flex-col items-center justify-center p-10">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-medium">Importing Members...</h3>
          <p className="text-sm text-gray-500">Please wait while we process your file.</p>
        </div>
      )}

      {step === 'complete' && (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Import Completed</h3>
          <p className="text-sm text-gray-500 mb-6">
            Successfully imported {importStats.success} members. <br />
            {importStats.failed > 0 && `Failed to import ${importStats.failed} members.`}
          </p>
          <Button onClick={onSuccess}>Done</Button>
        </div>
      )}
    </div>
  );
};
