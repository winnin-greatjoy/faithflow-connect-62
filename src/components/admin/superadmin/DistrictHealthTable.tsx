import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export interface DistrictHealthData {
  id: string;
  name: string;
  branchCount: number;
  hasOverseer: boolean;
  hasHQ: boolean;
}

interface DistrictHealthTableProps {
  districts: DistrictHealthData[];
}

export const DistrictHealthTable: React.FC<DistrictHealthTableProps> = ({ districts }) => {
  // Sort by status priority (Critical > Attention > Healthy)
  const sortedDistricts = [...districts].sort((a, b) => {
    const getScore = (d: DistrictHealthData) => {
      let score = 0;
      if (!d.hasOverseer) score += 2;
      if (!d.hasHQ) score += 2;
      return score;
    };
    return getScore(b) - getScore(a);
  });

  const getStatus = (d: DistrictHealthData) => {
    if (!d.hasOverseer || !d.hasHQ) return { label: 'Critical', color: 'bg-red-100 text-red-800' };
    if (d.branchCount === 0) return { label: 'Attention', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Healthy', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">District Health Matrix</h3>
        <p className="text-sm text-muted-foreground">Governance compliance and structure status</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>District Name</TableHead>
              <TableHead className="text-center">Branches</TableHead>
              <TableHead className="text-center">Overseer</TableHead>
              <TableHead className="text-center">HQ Config</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDistricts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No districts found.
                </TableCell>
              </TableRow>
            ) : (
              sortedDistricts.map((district) => {
                const status = getStatus(district);
                return (
                  <TableRow key={district.id}>
                    <TableCell className="font-medium">{district.name}</TableCell>
                    <TableCell className="text-center">{district.branchCount}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {district.hasOverseer ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {district.hasHQ ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
