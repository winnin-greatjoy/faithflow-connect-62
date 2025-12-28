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
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConvertProcess, ConvertStatus } from "@/types/schema";

export const ConvertApprovalTable = () => {
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const { data: converts, isLoading } = useQuery({
        queryKey: ["converts-approval"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("convert_process")
                .select(`
          *,
          member:members (
            id,
            full_name,
            branch:church_branches (name)
          )
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as unknown as (ConvertProcess & {
                member: { full_name: string; branch?: { name: string } };
            })[];
        },
    });



    // Helper to handle approval with member_id logic correction
    const handleApprove = async (convert: any) => {
        setProcessingId(convert.id);
        // Determine next step based on user role? 
        // Ideally we check if the user *can* perform this action. 
        // For now, assuming Super Admin can do ALL steps or just the National step if they want.
        // The implementation plan says "Branch -> District -> National".
        // Super Admin is usually National.

        // NOTE: Real implementation should verify USER ROLE before allowing the click.
        // For this MVP step, we'll allow the linear progression.

        try {
            let nextStatus: ConvertStatus = convert.status;
            const updates: any = {};
            const { data: { user } } = await supabase.auth.getUser();

            if (convert.status === "pending_branch_review") {
                nextStatus = "pending_district_review";
                updates.branch_approved_by = user?.id;
                updates.branch_approval_date = new Date().toISOString();
            } else if (convert.status === "pending_district_review") {
                nextStatus = "approved_for_baptism";
                updates.district_approved_by = user?.id;
                updates.district_approval_date = new Date().toISOString();
            } else if (convert.status === "approved_for_baptism") {
                nextStatus = "baptized";
                updates.national_approved_by = user?.id;
                updates.national_approval_date = new Date().toISOString();
                updates.baptism_date = new Date().toISOString();
            }

            updates.status = nextStatus;

            const { error } = await supabase
                .from("convert_process")
                .update(updates)
                .eq("id", convert.id);

            if (error) throw error;

            if (nextStatus === "baptized") {
                // Update the member table directly since profiles is linked to auth users 
                // and many converts might not have auth users (profiles) yet?
                // "profiles" table is REFERENCES auth.users.
                // "members" table is the church registry.
                // We should update the "members" table.

                const { error: memberError } = await supabase
                    .from("members")
                    .update({
                        membership_level: "baptized",
                        baptism_date: new Date().toISOString(),
                        baptized_sub_level: "disciple" // Auto assign Disciple role
                    })
                    .eq("id", convert.member_id);

                if (memberError) {
                    console.error("Failed to update member status:", memberError);
                    toast.error("Convert status updated but failed to update member record.");
                }
            }

            queryClient.invalidateQueries({ queryKey: ["converts-approval"] });
            toast.success(`Convert moved to ${nextStatus.replace(/_/g, " ")}`);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: ConvertStatus) => {
        switch (status) {
            case "pending_branch_review": return <Badge variant="outline">Pending Branch</Badge>;
            case "pending_district_review": return <Badge variant="secondary">Pending District</Badge>;
            case "approved_for_baptism": return <Badge className="bg-blue-500">Ready for Baptism</Badge>;
            case "baptized": return <Badge className="bg-green-500">Baptized</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Current Status</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {converts?.map((convert) => (
                        <TableRow key={convert.id}>
                            <TableCell className="font-medium">{convert.member.full_name}</TableCell>
                            <TableCell>{convert.member.branch?.name || "N/A"}</TableCell>
                            <TableCell>{getStatusBadge(convert.status)}</TableCell>
                            <TableCell>{new Date(convert.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                {convert.status !== "baptized" && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(convert)}
                                        disabled={processingId === convert.id}
                                    >
                                        {processingId === convert.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                                        Approve Next Step
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {!converts || converts.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No converts pending approval.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
