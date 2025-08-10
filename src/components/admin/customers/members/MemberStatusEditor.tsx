
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type StatusRow = {
  id: string;
  customer_id: string;
  member_id: string | null;
  site_name: string;
  status: string;
  updated_at?: string | null;
  updated_by?: string | null;
};

const STATUS_OPTIONS = [
  "Granskar",
  "Skickad",
  "Godkänt",
  "Avslaget",
];

interface MemberStatusEditorProps {
  customerId: string;
  memberId: string;
}

export function MemberStatusEditor({ customerId, memberId }: MemberStatusEditorProps) {
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSite, setNewSite] = useState("");
  const [newStatus, setNewStatus] = useState(STATUS_OPTIONS[0]);

  const canSubmit = useMemo(() => newSite.trim().length > 0, [newSite]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_site_statuses")
      .select("*")
      .eq("customer_id", customerId)
      .eq("member_id", memberId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to load statuses:", error);
      toast.error("Failed to load statuses");
    } else {
      setRows((data as StatusRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (customerId && memberId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, memberId]);

  const addRow = async () => {
    if (!canSubmit) return;
    const payload = {
      customer_id: customerId,
      member_id: memberId,
      site_name: newSite.trim(),
      status: newStatus,
    };
    const { data, error } = await supabase
      .from("customer_site_statuses")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to add status:", error);
      toast.error("Failed to add status");
      return;
    }
    toast.success("Status added");
    setRows((prev) => [data as StatusRow, ...prev]);
    setNewSite("");
    setNewStatus(STATUS_OPTIONS[0]);
  };

  const updateStatus = async (rowId: string, status: string) => {
    const { data, error } = await supabase
      .from("customer_site_statuses")
      .update({ status })
      .eq("id", rowId)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === rowId ? (data as StatusRow) : r)));
  };

  const deleteRow = async (rowId: string) => {
    const { error } = await supabase
      .from("customer_site_statuses")
      .delete()
      .eq("id", rowId);

    if (error) {
      console.error("Failed to delete status:", error);
      toast.error("Failed to delete status");
      return;
    }
    toast.success("Status deleted");
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2">
          <Label htmlFor="site">Site</Label>
          <Input
            id="site"
            placeholder="MrKoll, Ratsit, ..."
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="w-full h-9 rounded-md border border-border bg-background text-foreground px-3"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-1 flex items-end">
          <Button className="w-full" onClick={addRow} disabled={!canSubmit || loading}>
            Add
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading statuses...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No statuses yet.</div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col md:flex-row gap-2 md:items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="font-medium">{row.site_name}</div>
              <div className="flex items-center gap-2">
                <select
                  className="h-9 rounded-md border border-border bg-background text-foreground px-3"
                  value={row.status}
                  onChange={(e) => updateStatus(row.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <Button variant="destructive" size="icon" onClick={() => deleteRow(row.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
