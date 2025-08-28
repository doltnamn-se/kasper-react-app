import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCustomerMembers } from "../members/hooks/useCustomerMembers";
import { toast } from "sonner";

interface SiteStatusManagerProps {
  customerId: string;
  customerName?: string;
  subscriptionPlan?: string | null;
}
type SiteStatus = {
  id: string;
  site_name: string;
  status: string;
};
export function SiteStatusManager({
  customerId,
  customerName,
  subscriptionPlan
}: SiteStatusManagerProps) {
const { language } = useLanguage();
const [siteStatuses, setSiteStatuses] = useState<SiteStatus[]>([]);
const [isLoading, setIsLoading] = useState(true);
const { members: customerMembers } = useCustomerMembers(customerId);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if user has member management subscription
  const hasMembers = subscriptionPlan && (subscriptionPlan.includes('parskydd') || subscriptionPlan.includes('familjeskydd'));
  const sites = [{
    name: 'Mrkoll',
    icon: '/fonts/MrKoll.svg'
  }, {
    name: 'Ratsit',
    icon: '/fonts/Ratsit.svg'
  }, {
    name: 'Hitta',
    icon: '/fonts/Hitta.svg'
  }, {
    name: 'Merinfo',
    icon: '/fonts/Merinfo.svg'
  }, {
    name: 'Eniro',
    icon: '/fonts/Eniro.svg'
  }, {
    name: 'Birthday',
    icon: '/fonts/Birthday.svg'
  }];
  const statusOptions = [{
    value: 'Granskar',
    label: language === 'sv' ? 'Granskar' : 'Reviewing'
  }, {
    value: 'Adress dold',
    label: language === 'sv' ? 'Adress dold' : 'Address hidden'
  }, {
    value: 'Dold',
    label: language === 'sv' ? 'Dold' : 'Hidden'
  }, {
    value: 'Borttagen',
    label: language === 'sv' ? 'Borttagen' : 'Removed'
  }, {
    value: 'Begäran skickad',
    label: language === 'sv' ? 'Begäran skickad' : 'Request sent'
  }, {
    value: 'Synlig',
    label: language === 'sv' ? 'Synlig' : 'Visible'
  }];
useEffect(() => {
    fetchSiteStatuses();
  }, [customerId, selectedMemberId]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMemberDropdown(false);
      }
    };

    if (showMemberDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMemberDropdown]);
  const fetchSiteStatuses = async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('customer_site_statuses')
        .select('*')
        .eq('customer_id', customerId);
      if (selectedMemberId) {
        query = query.eq('member_id', selectedMemberId);
      } else {
        query = query.is('member_id', null);
      }
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching site statuses:', error);
        toast.error('Failed to load site statuses');
        return;
      }
      const statusMap = new Map();
      data?.forEach(status => {
        statusMap.set(status.site_name, status);
      });
      const fullStatuses = sites.map(site => {
        const existingStatus = statusMap.get(site.name);
        if (existingStatus) {
          return existingStatus;
        } else {
          return {
            id: '',
            site_name: site.name,
            status: 'Granskar',
            customer_id: customerId
          };
        }
      });
      setSiteStatuses(fullStatuses);
    } catch (error) {
      console.error('Error in fetchSiteStatuses:', error);
      toast.error('Failed to load site statuses');
    } finally {
      setIsLoading(false);
    }
  };
  const updateSiteStatus = async (siteName: string, newStatus: string) => {
    try {
      console.log('updateSiteStatus called:', { siteName, newStatus, customerId, selectedMemberId });
      
      // Check for existing status with correct customer_id, site_name AND member_id combination
      let query = supabase
        .from('customer_site_statuses')
        .select('*')
        .eq('customer_id', customerId)
        .eq('site_name', siteName);
      
      if (selectedMemberId) {
        query = query.eq('member_id', selectedMemberId);
      } else {
        query = query.is('member_id', null);
      }
      
      const { data: existingStatuses, error: queryError } = await query;
      
      console.log('Query result:', { existingStatuses, queryError });
      
      if (queryError) throw queryError;
      
      const existingStatus = existingStatuses?.[0];
      
      if (existingStatus?.id) {
        console.log('Updating existing status:', existingStatus);
        const updateData = {
          status: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          member_id: selectedMemberId
        };
        console.log('Update data:', updateData);
        
        const {
          error
        } = await supabase.from('customer_site_statuses').update(updateData).eq('id', existingStatus.id);
        
        console.log('Update result:', { error });
        if (error) throw error;
      } else {
        console.log('Creating new status');
        const insertData = {
          customer_id: customerId,
          site_name: siteName,
          status: newStatus,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          member_id: selectedMemberId
        };
        console.log('Insert data:', insertData);
        
        const {
          error
        } = await supabase.from('customer_site_statuses').insert(insertData);
        
        console.log('Insert result:', { error });
        if (error) throw error;
      }
      setSiteStatuses(prev => prev.map(s => s.site_name === siteName ? {
        ...s,
        status: newStatus
      } : s));
      toast.success('Site status updated successfully');
      fetchSiteStatuses();
    } catch (error) {
      console.error('Error updating site status:', error);
      toast.error('Failed to update site status');
    }
  };
  if (isLoading) {
    return <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white"></div>
      </div>;
  }
  return <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between mt-[-25px]">
        <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFF]">
          {language === 'sv' ? 'Upplysningssidor' : 'Search sites'}
        </h3>
        {hasMembers && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{language === 'sv' ? 'Användare' : 'User'}</span>
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex h-8 w-[180px] items-center justify-between rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-1 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Custom dropdown clicked');
                  setShowMemberDropdown(!showMemberDropdown);
                }}
                type="button"
              >
                <span>
                  {selectedMemberId 
                    ? customerMembers.find(m => m.id === selectedMemberId)?.display_name 
                    : (customerName || (language === 'sv' ? 'Huvudanvändare' : 'Main user'))
                  }
                </span>
                <svg
                  className="h-4 w-4 opacity-50"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              
              {showMemberDropdown && (
                <div className="absolute top-full left-0 z-[9999] mt-1 w-full rounded-md border bg-white dark:bg-gray-800 shadow-lg">
                  <div className="py-1">
                    <button
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        !selectedMemberId ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Selected main user');
                        setSelectedMemberId(null);
                        setShowMemberDropdown(false);
                      }}
                    >
                      {customerName || (language === 'sv' ? 'Huvudanvändare' : 'Main user')}
                    </button>
                    {customerMembers.map((member) => (
                      <button
                        key={member.id}
                        className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          selectedMemberId === member.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Selected member:', member.display_name);
                          setSelectedMemberId(member.id);
                          setShowMemberDropdown(false);
                        }}
                      >
                        {member.display_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {sites.map(site => {
        const siteStatus = siteStatuses.find(s => s.site_name === site.name);
        return <div key={site.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={site.icon} alt={site.name} className="w-6 h-6 object-contain" />
                <span className="text-sm">{site.name}</span>
              </div>
              <Select value={siteStatus?.status || 'Granskar'} onValueChange={value => updateSiteStatus(site.name, value)}>
                <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {statusOptions.map(option => <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>;
      })}
      </div>
    </div>;
}
