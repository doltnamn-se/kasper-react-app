import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

const statusSteps = ["received", "in_progress", "request_submitted", "completed"];

export const StatusStepper = ({ currentStatus }: { currentStatus: string }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const normalizedStatus = currentStatus.toLowerCase();
    let statusIndex = statusSteps.indexOf(normalizedStatus);
    
    // Map database status to UI status
    if (normalizedStatus === 'case_started') {
      statusIndex = statusSteps.indexOf('in_progress');
    } else if (normalizedStatus === 'removal_approved') {
      statusIndex = statusSteps.indexOf('completed');
    }
    
    const progressPercentage = ((statusIndex + 1) / statusSteps.length) * 100;
    console.log('Status:', currentStatus, 'Index:', statusIndex, 'Progress:', progressPercentage);
    
    setProgress(progressPercentage);
  }, [currentStatus]);

  return (
    <Progress 
      value={progress} 
      className="h-3 transition-all" 
    />
  );
};