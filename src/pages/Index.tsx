import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4">
        <div className="flex justify-end">
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
        {/* Your app content will go here */}
      </main>
    </div>
  );
};

export default Index;