import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";

type SearchResult = {
  id: string;
  title: string;
  url: string;
  category?: string;
};

export const SearchBar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const inputRef = useRef<HTMLInputElement>(null);
  const [showResults, setShowResults] = useState(false);

  const getSearchResults = (query: string): SearchResult[] => {
    if (!query) return [];

    const allResults: SearchResult[] = [
      { id: "1", title: t('nav.home'), url: "/", category: "Pages" },
      { id: "2", title: t('nav.checklist'), url: "/checklist", category: "Pages" },
      { id: "3", title: t('nav.my.links'), url: "/my-links", category: "Pages" },
      { id: "4", title: t('nav.address.alerts'), url: "/address-alerts", category: "Pages" },
      { id: "5", title: t('nav.guides'), url: "/guides", category: "Pages" },
      { id: "6", title: t('profile.settings'), url: "/settings", category: "Settings" },
    ];

    return allResults.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  };

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const results = getSearchResults(searchQuery);
    setSearchResults(results);
  }, [searchQuery]);

  const handleSelect = (url: string) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(url);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
          setShowResults(true);
        }
      }
      
      // Handle Escape key
      if (e.key === 'Escape' && inputRef.current) {
        inputRef.current.blur();
        setShowResults(false);
        setIsSearchFocused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e5e5e] dark:text-gray-400" />
        <Input
          ref={inputRef}
          id="global-search"
          type="search"
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
          onBlur={() => {
            setIsSearchFocused(false);
          }}
          className="pl-10 pr-24 bg-white dark:bg-[#1c1c1e] border-none shadow-none hover:shadow-sm focus:shadow-md focus-visible:ring-0 text-[#000000] dark:text-gray-300 placeholder:text-[#5e5e5e] dark:placeholder:text-gray-400 transition-all outline-none"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-[#000000] dark:text-[#FFFFFF]" />
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

      {showResults && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1c1c1e] rounded-md shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
          <Command className="border-none">
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {searchResults.length > 0 && (
                <CommandGroup>
                  {searchResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.url)}
                      className="cursor-pointer flex items-center justify-between py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span>{result.title}</span>
                      {result.category && (
                        <span className="text-xs text-muted-foreground">{result.category}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};