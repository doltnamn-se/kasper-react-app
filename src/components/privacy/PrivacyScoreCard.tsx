
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrivacyScore } from "@/hooks/usePrivacyScore";
import { Progress } from "@/components/ui/progress";
import { MousePointerClick, MapPinHouse, EyeOff, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell } from 'recharts';

export const PrivacyScoreCard = () => {
  const { calculateScore } = usePrivacyScore();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const score = calculateScore();

  const getColorClass = (value: number) => {
    if (value >= 80) return "text-green-500 dark:text-green-400";
    if (value >= 50) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  const getProgressClass = (value: number) => {
    if (value >= 80) return "bg-green-500 dark:bg-green-400";
    if (value >= 50) return "bg-yellow-500 dark:bg-yellow-400";
    return "bg-red-500 dark:bg-red-400";
  };

  const ScoreItem = ({ 
    icon: Icon, 
    title, 
    score, 
    onClick 
  }: { 
    icon: any; 
    title: string; 
    score: number;
    onClick: () => void;
  }) => (
    <div 
      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <Icon className={cn("w-5 h-5",