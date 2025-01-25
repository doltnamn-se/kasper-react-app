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
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isClearHovered, setIsClearHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const inputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
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
    setIsSearchFocused(false);
    navigate(url);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
          setShowResults(true);
          setIsSearchFocused(true);
        }
      }
      
      if (e.key === 'Escape' && inputRef.current) {
        inputRef.current.blur();
        setShowResults(false);
        setIsSearchFocused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const focusSearch = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setShowResults(true);
      setIsSearchFocused(true);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 backdrop-blur-[2px] z-[39] transition-all duration-500 ease-in-out",
          isSearchFocused ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => {
          setIsSearchFocused(false);
          setShowResults(false);
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }}
      />
      <div 
        className={cn(
          "relative w-full",
          isSearchFocused && "z-[41]"
        )}
        onMouseEnter={() => setIsSearchHovered(true)}
        onMouseLeave={() => setIsSearchHovered(false)}
      >
        <div className="relative">
          <button
            onClick={focusSearch}
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

        {showResults && searchQuery && (
          <div 
            ref={searchResultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1c1c1e] rounded-md shadow-lg border border-gray-200 dark:border-[#232325] overflow-hidden z-[41] transition-transform duration-300 origin-top"
          >
            <Command className="border-none bg-transparent">
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {searchResults.length > 0 && (
                  <CommandGroup>
                    {searchResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result.url)}
                        className={cn(
                          "cursor-pointer flex items-center justify-between py-2",
                          "hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d]",
                          "data-[selected=true]:bg-[#f3f4f6] dark:data-[selected=true]:bg-[#2d2d2d]",
                          "transition-colors duration-200"
                        )}
                      >
                        <span className="font-medium text-[#000000] dark:text-[#FFFFFF]">
                          {result.title}
                        </span>
                        {result.category && (
                          <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
                            {result.category}
                          </span>
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
    </>
  );
};