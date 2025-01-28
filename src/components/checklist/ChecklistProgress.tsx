import { PieChart, Pie, Cell } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

interface ChecklistProgressProps {
  progress: number;
}

export const ChecklistProgress = ({ progress }: ChecklistProgressProps) => {
  const isMobile = useIsMobile();
  const progressData = [{ value: progress }, { value: 100 - progress }];
  const COLORS = ['url(#progressGradient)', 'url(#backgroundGradient)'];

  return (
    <div className={`relative ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-black ${isMobile ? 'text-sm' : 'text-base'}`}>{progress}%</span>
      </div>
      <PieChart width={isMobile ? 64 : 80} height={isMobile ? 64 : 80}>
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
            <animate
              attributeName="x1"
              values="0;1;0"
              dur="8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="1;2;1"
              dur="8s"
              repeatCount="indefinite"
            />
            <stop offset="0%" stopColor="#4d985e">
              <animate
                attributeName="offset"
                values="0;0.5;0"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#72bd5f">
              <animate
                attributeName="offset"
                values="0.5;1;0.5"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          <linearGradient id="backgroundGradient" x1="0" y1="0" x2="1" y2="0">
            <animate
              attributeName="x1"
              values="0;1;0"
              dur="8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              values="1;2;1"
              dur="8s"
              repeatCount="indefinite"
            />
            <stop offset="0%" className="dark:text-[#243024] text-[#e8f5e9]" stopColor="currentColor" />
            <stop offset="100%" className="dark:text-[#2f4030] text-[#c8e6c9]" stopColor="currentColor" />
          </linearGradient>
        </defs>
        <Pie
          data={progressData}
          innerRadius={isMobile ? 20 : 25}
          outerRadius={isMobile ? 28 : 35}
          paddingAngle={0}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          stroke="none"
        >
          {progressData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
};