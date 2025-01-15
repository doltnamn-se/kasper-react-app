import { Moon } from "lucide-react";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const DarkModeToggle = ({ isDarkMode, onToggle }: DarkModeToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-6 px-4 py-3 rounded-lg">
      <label className="flex items-center cursor-pointer text-[#394a56] dark:text-slate-200">
        <div className="flex items-center gap-3">
          <Moon className="w-4 h-4 text-[#4c4c49] dark:text-[#67676c] stroke-[1.5]" />
          <span className="text-sm">Mörkt läge</span>
        </div>
        
        <div className="relative ml-4">
          <input
            type="checkbox"
            className="sr-only"
            checked={isDarkMode}
            onChange={onToggle}
          />
          <div className="isolate relative h-[30px] w-[60px] rounded-[15px] overflow-hidden
            shadow-[
              -8px_-4px_8px_0px_#ffffff,
              8px_4px_12px_0px_#d1d9e6,
              4px_4px_4px_0px_#d1d9e6_inset,
              -4px_-4px_4px_0px_#ffffff_inset
            ]
            dark:shadow-[
              -8px_-4px_8px_0px_rgba(255,255,255,0.05),
              8px_4px_12px_0px_rgba(0,0,0,0.2),
              4px_4px_4px_0px_rgba(0,0,0,0.2)_inset,
              -4px_-4px_4px_0px_rgba(255,255,255,0.05)_inset
            ]">
            <div className={`
              h-full w-[200%] rounded-[15px]
              shadow-[-8px_-4px_8px_0px_#ffffff,8px_4px_12px_0px_#d1d9e6]
              dark:shadow-[-8px_-4px_8px_0px_rgba(255,255,255,0.05),8px_4px_12px_0px_rgba(0,0,0,0.2)]
              transition-transform duration-400 ease-[cubic-bezier(0.85,0.05,0.18,1.35)]
              ${isDarkMode ? 'translate-x-[25%]' : '-translate-x-[75%]'}
              bg-[#ecf0f3] dark:bg-[#232325]
            `}/>
          </div>
        </div>
      </label>
    </div>
  );
};