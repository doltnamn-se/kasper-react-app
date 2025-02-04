import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const AddressAlerts = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: alerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ['address-alerts'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from('address_alerts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }

      return data || [];
    }
  });

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Adresslarm | Doltnamn.se" : 
      "Address Alerts | Doltnamn.se";

    const root = document.getElementById('root');
    if (root) {
      root.classList.add('animate-fadeIn');
    }
  }, [language]);

  const handleSubmit = async () => {
    if (!newAlert.trim()) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('addressAlerts.emptyError'),
      });
      return;
    }

    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('auth.notLoggedIn'),
      });
      return;
    }

    const { error } = await supabase
      .from('address_alerts')
      .insert([
        {
          user_id: session.user.id,
          address: newAlert.trim(),
        }
      ]);

    if (error) {
      console.error('Error creating alert:', error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('addressAlerts.createError'),
      });
    } else {
      toast({
        title: t('success'),
        description: t('addressAlerts.created'),
      });
      setNewAlert("");
      setIsDialogOpen(false);
      refetchAlerts();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (alertId: number) => {
    const { error } = await supabase
      .from('address_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      console.error('Error deleting alert:', error);
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('addressAlerts.deleteError'),
      });
    } else {
      toast({
        title: t('success'),
        description: t('addressAlerts.deleted'),
      });
      refetchAlerts();
    }
  };

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white">
            {t('nav.addressAlerts')}
          </h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            {t('addressAlerts.create')}
          </Button>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white dark:bg-[#1c1c1e] p-4 rounded-lg border border-[#e5e7eb] dark:border-[#232325] flex justify-between items-center"
            >
              <span className="text-[#000000] dark:text-white">{alert.address}</span>
              <Button
                variant="ghost"
                onClick={() => handleDelete(alert.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                {t('delete')}
              </Button>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('addressAlerts.empty')}
            </div>
          )}
        </div>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('addressAlerts.createTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('addressAlerts.createDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                value={newAlert}
                onChange={(e) => setNewAlert(e.target.value)}
                placeholder={t('addressAlerts.placeholder')}
              />
            </div>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t('saving') : t('save')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default AddressAlerts;