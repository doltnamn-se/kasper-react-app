import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';

export const OnboardingComplete = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Welcome Aboard! 🎉</h1>
        <p className="text-muted-foreground">
          Your account is now fully set up and ready to use
        </p>
      </div>

      <Button
        onClick={() => navigate("/")}
        className="w-full"
      >
        Go to Dashboard
      </Button>
    </div>
  );
};