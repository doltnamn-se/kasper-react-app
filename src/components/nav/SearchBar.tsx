import { useState } from "react";
import { Search, ArrowBigUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export const SearchBar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e5e5e] dark:text-gray-400" />
      <Input 
        id="global-search"
        type="search" 
        placeholder={t('search.placeholder')}
        className="pl-10 pr-24 bg-white dark:bg-[#1c1c1e] border-none shadow-none hover:shadow-sm focus:shadow-md focus-visible:ring-0 text-[#000000] dark:text-gray-300 placeholder:text-[#5e5e5e] dark:placeholder:text-gray-400 transition-all outline-none"
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
      />
      <div className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none transition-opacity duration-200",
        isSearchFocused ? "opacity-0" : "opacity-100"
      )}>
        <div className="flex items-center gap-1 text-[#5e5e5e] dark:text-gray-400 bg-[#f4f4f4] dark:bg-[#232325] px-1.5 py-0.5 rounded text-xs">
          <ArrowBigUp className="w-3 h-3 mr-0.5" />
          Shift
        </div>
        <span className="text-[#5e5e5e] dark:text-gray-400 text-[10px]">+</span>
        <div className="flex items-center gap-1 text-[#5e5e5e] dark:text-gray-400 bg-[#f4f4f4] dark:bg-[#232325] px-1.5 py-0.5 rounded text-xs">
          S
        </div>
      </div>
    </div>
  );
};