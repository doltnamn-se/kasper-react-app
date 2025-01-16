import { Bell, ChevronDown, MessageSquare, Search, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const TopNav = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  return (
    <div className="fixed top-0 right-0 left-72 h-16 bg-transparent backdrop-blur-sm z-50 border-b border-[#e5e7eb] dark:border-[#232325]">
      <div className="flex items-center justify-between h-full px-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e5e5e] dark:text-gray-400" />
            <Input 
              type="search" 
              placeholder="Sök..." 
              className="pl-10 bg-transparent border-none focus-visible:ring-0 text-[#000000] dark:text-gray-300 placeholder:text-[#5e5e5e] dark:placeholder:text-gray-400"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325]">
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325]">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325]">
            <Settings className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-[#000000] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-[#232325] ml-2"
          >
            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-[#303032] flex items-center justify-center">
              <User className="w-4 h-4 text-[#5e5e5e] dark:text-gray-400" />
            </div>
            <span className="text-sm font-medium">{userEmail}</span>
            <ChevronDown className="w-4 h-4 text-[#5e5e5e] dark:text-gray-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};