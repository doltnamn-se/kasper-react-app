import { useQuery } from "@tanstack/react-query";
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
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];

type CustomerWithProfile = Customer & {
  profile: Profile;
};

const AdminCustomers = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerFirstName, setNewCustomerFirstName] = useState("");
  const [newCustomerLastName, setNewCustomerLastName] = useState("");
  
  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers data...');
      
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles (*)
        `);
        
      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      
      console.log('Customers data received:', data);
      return data as CustomerWithProfile[];
    },
  });

  const handleCreateCustomer = async () => {
    try {
      setIsCreating(true);
      console.log('Creating new customer...');

      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newCustomerEmail,
        email_confirm: true,
        password: Math.random().toString(36).slice(-8), // Generate a random password
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

      // Update the profile with first and last name
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

      // Reset form and close dialog
      setNewCustomerEmail("");
      setNewCustomerFirstName("");
      setNewCustomerLastName("");
      setIsCreating(false);
      refetch(); // Refresh the customers list
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="mt-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">Error loading customers. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        
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
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  {`${customer.profile?.first_name || ''} ${customer.profile?.last_name || ''}`.trim() || 'No name provided'}
                </TableCell>
                <TableCell>
                  {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {customer.onboarding_completed ? 
                    'Completed' : 
                    `Step ${customer.onboarding_step || 1}`}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Coming soon",
                        description: "Customer details view will be implemented soon.",
                      });
                    }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCustomers;