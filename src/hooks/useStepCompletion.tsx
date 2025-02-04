import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import confetti from 'canvas-confetti';
import { useEffect } from "react";

export const useStepCompletion = () => {
  const navigate = useNavigate();

  const launchConfetti = () => {
    console.log('Launching confetti celebration');
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 60,
        startVelocity: 30,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data: progress, error } = await supabase
          .from('customer_checklist_progress')
          .select('completed_at')
          .eq('customer_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking checklist completion:', error);
          return;
        }

        console.log('Checking checklist completion:', progress);

        if (progress?.completed_at) {
          console.log('Checklist completed! Triggering celebration');
          launchConfetti();
          
          // Navigate to home page after a 3-second delay to allow confetti to be visible
          setTimeout(() => {
            console.log('Navigating to home page');
            navigate('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Error in checkCompletion:', error);
      }
    };

    checkCompletion();
  }, []); // Empty dependency array to run only once when component mounts

  const handleStepComplete = async () => {
    console.log('Step completed, checking overall completion');
    // This function now just triggers a re-check of completion status
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const { data: progress, error } = await supabase
      .from('customer_checklist_progress')
      .select('completed_at')
      .eq('customer_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking step completion:', error);
      return;
    }

    console.log('Current progress:', progress);
  };

  return { handleStepComplete };
};