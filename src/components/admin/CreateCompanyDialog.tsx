import { useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateCompanyDialogProps {
  onCompanyCreated: () => void;
  children: ReactNode;
}

export const CreateCompanyDialog = ({ onCompanyCreated, children }: CreateCompanyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: "",
    organization_number: "",
    contact_email: "",
    phone_number: "",
    billing_address: "",
    notes: ""
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error(language === 'sv' ? 'Företagsnamn krävs' : 'Company name is required');
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('companies')
        .insert([{
          name: formData.name.trim(),
          organization_number: formData.organization_number.trim() || null,
          contact_email: formData.contact_email.trim() || null,
          phone_number: formData.phone_number.trim() || null,
          billing_address: formData.billing_address.trim() || null,
          notes: formData.notes.trim() || null
        }]);

      if (error) throw error;

      toast.success(language === 'sv' ? 'Företag skapat' : 'Company created');
      setFormData({
        name: "",
        organization_number: "",
        contact_email: "",
        phone_number: "",
        billing_address: "",
        notes: ""
      });
      setOpen(false);
      onCompanyCreated();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error(language === 'sv' ? 'Kunde inte skapa företag' : 'Failed to create company');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#161617] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-medium">
            {language === 'sv' ? 'Lägg till företag' : 'Add Company'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {language === 'sv' ? 'Företagsnamn' : 'Company Name'} *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={language === 'sv' ? 'Företagets namn' : 'Company name'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-number">
              {language === 'sv' ? 'Organisationsnummer' : 'Organization Number'}
            </Label>
            <Input
              id="org-number"
              value={formData.organization_number}
              onChange={(e) => setFormData({ ...formData, organization_number: e.target.value })}
              placeholder="XXXXXX-XXXX"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === 'sv' ? 'Kontakt e-post' : 'Contact Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="kontakt@foretag.se"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                {language === 'sv' ? 'Telefon' : 'Phone'}
              </Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+46 XX XXX XX XX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              {language === 'sv' ? 'Faktureringsadress' : 'Billing Address'}
            </Label>
            <Textarea
              id="address"
              value={formData.billing_address}
              onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
              placeholder={language === 'sv' ? 'Gatuadress, Postnummer, Ort' : 'Street, Postal Code, City'}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              {language === 'sv' ? 'Anteckningar' : 'Notes'}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={language === 'sv' ? 'Ytterligare information...' : 'Additional information...'}
              rows={3}
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isCreating || !formData.name.trim()}
          className="w-full"
        >
          {isCreating 
            ? (language === 'sv' ? 'Skapar...' : 'Creating...') 
            : (language === 'sv' ? 'Skapa företag' : 'Create Company')
          }
        </Button>
      </DialogContent>
    </Dialog>
  );
};
