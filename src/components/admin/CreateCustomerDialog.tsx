import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateCustomerDialogProps {
  onCustomerCreated: () => void;
}

export const CreateCustomerDialog = ({ onCustomerCreated }: CreateCustomerDialogProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerFirstName, setNewCustomerFirstName] = useState("");
  const [newCustomerLastName, setNewCustomerLastName] = useState("");

  const handleCreateCustomer = async () => {
    try {
      setIsCreating(true);
      console.log('Creating new customer...');

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newCustomerEmail,
        email_confirm: true,
        password: Math.random().toString(36).slice(-8),
      });

      if (authError) {
        console.error("Error creating auth user:", authError);
        toast({
          title: "Error",
          description: "Failed to create customer. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        console.error("No user data returned");
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: newCustomerFirstName,
          last_name: newCustomerLastName,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        toast({
          title: "Error",
          description: "Failed to update customer profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Customer created successfully.",
      });

      setNewCustomerEmail("");
      setNewCustomerFirstName("");
      setNewCustomerLastName("");
      onCustomerCreated();
    } catch (err) {
      console.error("Error in customer creation:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@example.com"
              value={newCustomerEmail}
              onChange={(e) => setNewCustomerEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={newCustomerFirstName}
              onChange={(e) => setNewCustomerFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={newCustomerLastName}
              onChange={(e) => setNewCustomerLastName(e.target.value)}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleCreateCustomer}
            disabled={isCreating || !newCustomerEmail}
          >
            {isCreating ? "Creating..." : "Create Customer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};