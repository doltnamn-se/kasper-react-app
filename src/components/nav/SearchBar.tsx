import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { SearchBackdrop } from "./search/SearchBackdrop";
import { SearchInput } from "./search/SearchInput";
import { SearchResults, SearchResult } from "./search/SearchResults";

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

  return (
    <>
      <SearchBackdrop 
        isSearchFocused={isSearchFocused}
        onClose={() => {
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
        <SearchInput
          inputRef={inputRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          setShowResults={setShowResults}
          isSearchHovered={isSearchHovered}
          isClearHovered={isClearHovered}
          setIsClearHovered={setIsClearHovered}
          isMac={isMac}
          clearSearch={clearSearch}
        />

        <SearchResults
          searchResultsRef={searchResultsRef}
          showResults={showResults}
          searchQuery={searchQuery}
          searchResults={searchResults}
          handleSelect={handleSelect}
        />
      </div>
    </>
  );
};