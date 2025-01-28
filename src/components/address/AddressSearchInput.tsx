import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
  };
}

interface AddressSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: { street: string; postalCode: string; city: string }) => void;
  placeholder?: string;
  className?: string;
}

export const AddressSearchInput = ({
  value,
  onChange,
  onAddressSelect,
  placeholder,
  className,
}: AddressSearchInputProps) => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=se&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": language === "sv" ? "sv" : "en",
          },
        }
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching address:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    onChange(value);
    searchAddress(value);
  };

  const handleSelect = (result: AddressResult) => {
    const street = [result.address.road, result.address.house_number]
      .filter(Boolean)
      .join(" ");
    
    onAddressSelect({
      street: street,
      postalCode: result.address.postcode || "",
      city: result.address.city || "",
    });
    
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={
            placeholder ||
            (language === "sv" ? "Sök din adress..." : "Search your address...")
          }
          className={cn(
            "w-full justify-between",
            className
          )}
        />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={
              language === "sv"
                ? "Sök din adress..."
                : "Search your address..."
            }
            value={value}
            onValueChange={handleSearch}
          />
          <CommandEmpty>
            {loading
              ? language === "sv"
                ? "Söker..."
                : "Searching..."
              : language === "sv"
              ? "Inga resultat"
              : "No results"}
          </CommandEmpty>
          <CommandGroup>
            {results.map((result) => (
              <CommandItem
                key={result.display_name}
                onSelect={() => handleSelect(result)}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === result.display_name
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {result.display_name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};