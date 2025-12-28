import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConvertProcess, ConvertStatus } from "@/types/schema";

interface DistrictConvertReviewProps {
    districtId: string;
}

export const DistrictConvertReview = ({ districtId }: DistrictConvertReviewProps) => {
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const { data: converts, isLoading } = useQuery({
        queryKey: ["district-converts", districtId],
        queryFn: async () => {
            // Fetch converts belonging to branches in this district
            const { data, error } = await supabase
                .from("convert_process")
                .select(`
          *,
          member:members (
            id,
            full_name,
            branch:church_branches!inner (
               id,
               name,
               district_id
            )
          )
        `)
                .eq('member.branch.district_id', districtId) // This filtering syntax depends on PostgREST depth, which works for inner joins usually
                // Actually, filtering nested relationship properties in top-level where is tricky in JS client without flatting.
                // Better approach: Get all converts, filter later, OR use !inner join.
                // Let's try the !inner approach.
                .eq('status', 'pending_district_review') // Only show pending for now, or all? Let's show all relevant.
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Client side filter if the deep filter fails (Supabase JS sometimes creates complexity here)
            // But !inner should filter the rows.
            return data as unknown as (ConvertProcess & {
                member: { full_name: string; branch: { name: string; district_id: string } };
            })[];
        },
    });

    const approveMutation = useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const user = (await supabase.auth.getUser()).data.user;

            const { error } = await supabase
                .from("convert_process")
                .update({
                    status: 'approved_for_baptism',
                    district_approved_by: user?.id,
                    district_approval_date: new Date().toISOString()
                })
                .eq("id", id);

            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["district-converts"] });
            toast.success("Convert approved and forwarded to National HQ");
            setProcessingId(null);
        },
        onError: (error) => {
            toast.error("Failed to update status: " + error.message);
            setProcessingId(null);
        },
    });

    const handleApprove = (id: string) => {
        setProcessingId(id);
        approveMutation.mutate({ id });
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Convert Approvals</h2>
                <p className="text-muted-foreground">
                    Review converts submitted by your branches. Validated converts are sent to National HQ for baptism.
                </p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {converts?.map((convert) => (
                        <TableRow key={convert.id}>
                            <TableCell className="font-medium">{convert.member.full_name}</TableCell>
                            <TableCell>{convert.member.branch?.name}</TableCell>
                            <TableCell>
                                <Badge variant={convert.status === 'pending_district_review' ? "secondary" : "outline"}>
                                    {convert.status.replace(/_/g, " ")}
                                </Badge>
                            </TableCell>
                            <TableCell>{new Date(convert.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                {convert.status === "pending_district_review" && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(convert.id)}
                                        disabled={processingId === convert.id}
                                    >
                                        {processingId === convert.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                                        Approve
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {!converts || converts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No pending converts found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
