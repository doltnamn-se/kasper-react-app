
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, UserPlus } from "lucide-react";
import { useCustomerMembers } from "./hooks/useCustomerMembers";
import { MemberStatusEditor } from "./MemberStatusEditor";
import { CustomerMember } from "@/types/customer-member";

interface MemberManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName?: string;
}

export function MemberManagerDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
}: MemberManagerDialogProps) {
  const { members, loading, addMember, deleteMember } = useCustomerMembers(customerId);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  const activeMember = useMemo(
    () => members.find((m) => m.id === activeMemberId) || null,
    [members, activeMemberId]
  );

  const onAdd = async () => {
    const ok = await addMember(name, relationship);
    if (ok) {
      setName("");
      setRelationship("");
    }
  };

  const onDelete = async (memberId: string) => {
    if (!confirm("Delete this member? This will also delete their statuses.")) return;
    await deleteMember(memberId);
    if (activeMemberId === memberId) setActiveMemberId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Manage members for {customerName || "customer"}</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Add member */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <Label htmlFor="member-name">Name</Label>
                <Input
                  id="member-name"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="member-rel">Relationship</Label>
                <Input
                  id="member-rel"
                  placeholder="Partner, Child, etc."
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>
              <div>
                <Button onClick={onAdd} disabled={!name.trim()} className="w-full md:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add member
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Plan limits are enforced automatically. Parskydd: 1 member, Familjeskydd: up to 3 members.
            </p>
          </div>

          <Separator />

          {/* Member list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1 space-y-2">
              <div className="text-sm font-medium">Members</div>
              <ScrollArea className="h-[260px] rounded border border-border">
                <div className="p-2 space-y-2">
                  {loading ? (
                    <div className="text-sm text-muted-foreground p-2">Loading...</div>
                  ) : members.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2">No members yet.</div>
                  ) : (
                    members.map((m: CustomerMember) => (
                      <div
                        key={m.id}
                        className={`flex items-center justify-between rounded-md border p-2 cursor-pointer ${
                          activeMemberId === m.id ? "bg-muted/50" : "bg-background"
                        }`}
                        onClick={() => setActiveMemberId(m.id)}
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{m.display_name}</div>
                          {m.relationship && (
                            <div className="text-xs text-muted-foreground truncate">{m.relationship}</div>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(m.id);
                          }}
                          aria-label="Delete member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Status editor */}
            <div className="md:col-span-2">
              {!activeMember ? (
                <div className="text-sm text-muted-foreground h-full flex items-center justify-center border border-dashed rounded-lg p-6">
                  Select a member to manage statuses
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">Statuses for {activeMember.display_name}</div>
                    <p className="text-xs text-muted-foreground">
                      These are per-member statuses; links and address remain shared for the main customer.
                    </p>
                  </div>
                  <MemberStatusEditor
                    customerId={customerId}
                    memberId={activeMember.id}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
