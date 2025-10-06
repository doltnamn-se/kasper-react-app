import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { isIOS } from "@/capacitor";

export default function Intro() {
  const navigate = useNavigate();

  useEffect(() => {
    // If not iOS, redirect to auth
    if (!isIOS()) {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const handleSignIn = () => {
    // Mark that user has seen the intro
    localStorage.setItem("hasSeenIntro", "true");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main content area - will contain carousel slides */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Carousel content will go here</p>
      </div>

      {/* Bottom button */}
      <div className="p-6 pb-8">
        <Button 
          onClick={handleSignIn}
          className="w-full"
          size="lg"
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
