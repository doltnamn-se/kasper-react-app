import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { RefObject } from "react";

interface SearchInputProps {
  inputRef: RefObject<HTMLInputElement>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  setShowResults: (show: boolean) => void;
  isSearchHovered: boolean;
  isClearHovered: boolean;
  setIsClearHovered: (hovered: boolean) => void;
  isMac: boolean;
  clearSearch: () => void;
}

export const SearchInput = ({
  inputRef,
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  setShowResults,
  isSearchHovered,
  isClearHovered,
  setIsClearHovered,
  isMac,
  clearSearch
}: SearchInputProps) => {
  const { t } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => inputRef.current?.focus()}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
      >
        <Search 
          className={cn(
            "w-4 h-4 transition-colors",
            "text-[#000000A6] dark:text-[#FFFFFFA6]",
            (isSearchFocused || isSearchHovered) && "text-[#000000] dark:text-[#FFFFFF]"
          )} 
        />
      </button>
      <Input
        ref={inputRef}
        id="global-search"
        type="text"
        placeholder={t('search.placeholder')}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => {
          setIsSearchFocused(true);
          setShowResults(true);
        }}
        className={cn(
          "pl-10 pr-24 bg-white dark:bg-[#1c1c1e] border-none shadow-none",
          "hover:shadow-sm focus:shadow-md focus-visible:ring-0",
          "text-[#000000] dark:text-[#FFFFFF]",
          "placeholder:text-[#000000A6] dark:placeholder:text-[#FFFFFFA6]",
          (isSearchHovered || isSearchFocused) && "placeholder:text-[#000000] dark:placeholder:text-[#FFFFFF]",
          "transition-all duration-300 outline-none",
          "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
          "[&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden",
          isSearchFocused && "shadow-lg"
        )}
      />
      {searchQuery && (
        <button
          onClick={clearSearch}
          onMouseEnter={() => setIsClearHovered(true)}
          onMouseLeave={() => setIsClearHovered(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
        >
          <X 
            className={cn(
              "w-4 h-4 transition-colors",
              isClearHovered ? "text-[#000000] dark:text-[#FFFFFF]" : "text-[#000000A6] dark:text-[#FFFFFFA6]"
            )} 
          />
        </button>
      )}
      <div
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none transition-opacity duration-200",
          isSearchFocused ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="flex items-center gap-1 text-[#5e5e5e] dark:text-gray-400 bg-[#f4f4f4] dark:bg-[#232325] px-1.5 py-0.5 rounded text-xs">
          {isMac ? '⌘' : 'Ctrl'}
        </div>
        <span className="text-[#5e5e5e] dark:text-gray-400 text-[10px]">
          +
        </span>
        <div className="flex items-center gap-1 text-[#5e5e5e] dark:text-gray-400 bg-[#f4f4f4] dark:bg-[#232325] px-1.5 py-0.5 rounded text-xs">
          K
        </div>
      </div>
    </div>
  );
};