import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Upload, Users, Gift } from 'lucide-react';

interface PromotionalCode {
  id: string;
  code: string;
  assigned_to: string | null;
  assigned_at: string | null;
  status: 'available' | 'assigned' | 'used';
  created_at: string;
  notes: string | null;
  customer_email?: string;
  customer_name?: string;
}

const AdminPromotionalCodes = () => {
  const { t } = useLanguage();
  const [codes, setCodes] = useState<PromotionalCode[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkCodes, setBulkCodes] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    document.title = `Admin | ${t('kasper.friends.title')}`;
    fetchData();
  }, [t]);

  const fetchData = async () => {
    try {
      // Fetch promotional codes directly from the table with customer info
      const { data: codesData, error: codesError } = await supabase
        .from('promotional_codes' as any)
        .select(`
          *,
          customer:customers!left(
            id,
            profile:profiles!left(
              display_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (codesError) {
        console.error('Error fetching promotional codes:', codesError);
        setCodes([]);
      } else if (codesData && Array.isArray(codesData)) {
        // Transform the data to match our interface
        const transformedCodes = codesData.map((item: any) => ({
          id: item.id,
          code: item.code,
          assigned_to: item.assigned_to,
          assigned_at: item.assigned_at,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          notes: item.notes,
          customer_name: item.customer?.profile?.display_name || null,
          customer_email: item.customer?.profile?.email || null,
        }));
        setCodes(transformedCodes);
      } else {
        setCodes([]);
      }

      // Fetch customers without promotional codes
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select(`
          *,
          profile:profiles (
            display_name,
            email
          )
        `)
        .is('coupon_code', null)
        .order('created_at', { ascending: true });

      if (customersError) throw customersError;

      setCustomers(customersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load promotional codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkCodes.trim()) {
      toast({
        title: "Error",
        description: "Please enter promotional codes",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const codeList = bulkCodes
        .split('\n')
        .map(code => code.trim())
        .filter(code => code.length > 0);

      if (codeList.length === 0) {
        throw new Error('No valid codes found');
      }

      // Insert codes one by one to handle the type issue
      for (const code of codeList) {
        await supabase
          .from('promotional_codes' as any)
          .insert({ code, status: 'available' });
      }

      toast({
        title: "Success",
        description: `Imported ${codeList.length} promotional codes`,
      });

      setBulkCodes('');
      fetchData();
    } catch (error: any) {
      console.error('Error importing codes:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import promotional codes",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleAssignToExisting = async () => {
    setIsAssigning(true);
    try {
      const availableCodes = codes.filter(code => code.status === 'available');
      const customersWithoutCodes = customers;

      if (availableCodes.length === 0) {
        throw new Error('No available promotional codes');
      }

      if (customersWithoutCodes.length === 0) {
        toast({
          title: "Info",
          description: "All customers already have promotional codes assigned",
        });
        return;
      }

      const assignmentCount = Math.min(availableCodes.length, customersWithoutCodes.length);
      
      for (let i = 0; i < assignmentCount; i++) {
        const code = availableCodes[i];
        const customer = customersWithoutCodes[i];

        // Update promotional code
        await supabase
          .from('promotional_codes' as any)
          .update({
            assigned_to: customer.id,
            assigned_at: new Date().toISOString(),
            status: 'assigned'
          })
          .eq('id', code.id);

        // Update customer coupon_code
        await supabase
          .from('customers')
          .update({ coupon_code: code.code })
          .eq('id', customer.id);
      }

      toast({
        title: "Success",
        description: `Assigned promotional codes to ${assignmentCount} customers`,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error assigning codes:', error);
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign promotional codes",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="outline" className="text-green-600">Available</Badge>;
      case 'assigned':
        return <Badge variant="default">Assigned</Badge>;
      case 'used':
        return <Badge variant="secondary">Used</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: codes.length,
    available: codes.filter(c => c.status === 'available').length,
    assigned: codes.filter(c => c.status === 'assigned').length,
    used: codes.filter(c => c.status === 'used').length,
    customersWithoutCodes: customers.length
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading promotional codes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white">
          Kasper friends
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">{t('kasper.friends.stats.total')}</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">{t('kasper.friends.stats.available')}</p>
              <p className="text-xl font-bold text-green-600">{stats.available}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">{t('kasper.friends.stats.assigned')}</p>
              <p className="text-xl font-bold text-blue-600">{stats.assigned}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">{t('kasper.friends.stats.used')}</p>
              <p className="text-xl font-bold text-gray-600">{stats.used}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">{t('kasper.friends.stats.need.codes')}</p>
              <p className="text-xl font-bold text-orange-600">{stats.customersWithoutCodes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="manage">{t('kasper.friends.tabs.manage')}</TabsTrigger>
          <TabsTrigger value="import">{t('kasper.friends.tabs.import')}</TabsTrigger>
          <TabsTrigger value="assign">{t('kasper.friends.tabs.assign')}</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('kasper.friends.import.title')}
              </CardTitle>
              <CardDescription>
                {t('kasper.friends.import.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your promotional codes here, one per line..."
                value={bulkCodes}
                onChange={(e) => setBulkCodes(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {bulkCodes ? `${bulkCodes.split('\n').filter(line => line.trim()).length} codes ready to import` : 'No codes entered'}
                </p>
                <Button
                  onClick={handleBulkImport}
                  disabled={isImporting || !bulkCodes.trim()}
                  className="ml-auto"
                >
                  {isImporting ? 'Importing...' : 'Import Codes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('kasper.friends.assign.title')}
              </CardTitle>
              <CardDescription>
                {t('kasper.friends.assign.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Assignment Details</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This will assign {Math.min(stats.available, stats.customersWithoutCodes)} promotional codes to customers without codes.
                    Codes will be assigned to customers in order of registration (oldest first).
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">
                    <strong>{stats.available}</strong> codes available • 
                    <strong className="ml-1">{stats.customersWithoutCodes}</strong> customers need codes
                  </p>
                </div>
                <Button
                  onClick={handleAssignToExisting}
                  disabled={isAssigning || stats.available === 0 || stats.customersWithoutCodes === 0}
                >
                  {isAssigning ? 'Assigning...' : 'Assign Codes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('kasper.friends.manage.title')}</CardTitle>
              <CardDescription>
                {t('kasper.friends.manage.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono text-sm">{code.code}</TableCell>
                      <TableCell>{getStatusBadge(code.status)}</TableCell>
                      <TableCell>
                        {code.customer_name ? (
                          <div>
                            <p className="font-medium">{code.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{code.customer_email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {code.assigned_at ? (
                          new Date(code.assigned_at).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(code.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPromotionalCodes;