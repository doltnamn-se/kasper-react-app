import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Upload, Users, Gift, Search } from 'lucide-react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, flexRender, SortingState, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { TablePagination } from '@/components/ui/table-pagination';
import { EditUsageDialog } from '@/components/admin/promotional-codes/EditUsageDialog';
import { Input } from '@/components/ui/input';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

interface PromotionalCode {
  id: string;
  code: string;
  assigned_to: string | null;
  assigned_at: string | null;
  status: 'available' | 'assigned' | 'used';
  created_at: string;
  notes: string | null;
  usage_count: number;
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingCode, setEditingCode] = useState<PromotionalCode | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const isMobile = useBreakpoint('(max-width: 767px)');
  const [activeTab, setActiveTab] = useState<'manage'|'import'|'assign'>('manage');

  // Define table columns
  const columns = useMemo<ColumnDef<PromotionalCode>[]>(() => [
    {
      accessorKey: 'code',
      header: () => t('kasper.friends.table.code'),
      cell: ({ row }) => (
        <div className={isMobile ? "" : "font-mono text-sm"}>
          {isMobile ? (
            <Badge variant="outline" className="text-muted-foreground">
              {row.getValue('code')}
            </Badge>
          ) : (
            row.getValue('code')
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => t('kasper.friends.table.status'),
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
      meta: {
        className: 'hidden md:table-cell'
      }
    },
    {
      accessorKey: 'customer_name',
      header: () => t('kasper.friends.table.assigned.to'),
      cell: ({ row }) => {
        const customerName = row.getValue('customer_name') as string;
        return customerName ? (
          <p className="font-medium">{customerName}</p>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: 'usage_count',
      header: () => 'Usage Count',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium">{row.getValue('usage_count')}</span>
          <div className="text-xs text-gray-500">
            -{(row.getValue('usage_count') as number) * 50} kr
          </div>
        </div>
      ),
      meta: {
        className: 'hidden md:table-cell'
      }
    },
    {
      accessorKey: 'assigned_at',
      header: () => t('kasper.friends.table.assigned.date'),
      cell: ({ row }) => {
        const assignedAt = row.getValue('assigned_at') as string;
        return assignedAt ? (
          new Date(assignedAt).toLocaleDateString()
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
      meta: {
        className: 'hidden md:table-cell'
      }
    },
    {
      accessorKey: 'created_at',
      header: () => t('kasper.friends.table.created'),
      cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString(),
      meta: {
        className: 'hidden md:table-cell'
      }
    },
  ], [t, isMobile]);

  // Custom global filter function to search across all relevant fields
  const globalFilterFn = (row: any, columnId: string, value: string) => {
    const searchValue = value.toLowerCase();
    const code = row.original.code?.toLowerCase() || '';
    const customerName = row.original.customer_name?.toLowerCase() || '';
    const customerEmail = row.original.customer_email?.toLowerCase() || '';
    const status = row.original.status?.toLowerCase() || '';
    const notes = row.original.notes?.toLowerCase() || '';
    
    return (
      code.includes(searchValue) ||
      customerName.includes(searchValue) ||
      customerEmail.includes(searchValue) ||
      status.includes(searchValue) ||
      notes.includes(searchValue)
    );
  };

  // Initialize table
  const table = useReactTable({
    data: codes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: isMobile ? 10 : 20,
      },
    },
  });

  // Update page size when mobile state changes
  useEffect(() => {
    table.setPageSize(isMobile ? 10 : 20);
  }, [isMobile, table]);

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
          usage_count: item.usage_count || 0,
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
        return <Badge variant="outline" className="text-yellow-600">{t('kasper.friends.status.available')}</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="text-green-600">{t('kasper.friends.status.assigned')}</Badge>;
      case 'used':
        return <Badge variant="secondary">{t('kasper.friends.status.used')}</Badge>;
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
    <div className="mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1>
          Kasper Friends
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">{t('kasper.friends.stats.total')}</p>
              <p className="text-xl font-bold text-[#121212] dark:text-[#FFFFFF]">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">{t('kasper.friends.stats.available')}</p>
              <p className="text-xl font-bold text-[#121212] dark:text-[#FFFFFF]">{stats.available}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">{t('kasper.friends.stats.assigned')}</p>
              <p className="text-xl font-bold text-[#121212] dark:text-[#FFFFFF]">{stats.assigned}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">{t('kasper.friends.stats.need.codes')}</p>
              <p className="text-xl font-bold text-[#121212] dark:text-[#FFFFFF]">{stats.customersWithoutCodes}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manage' | 'import' | 'assign')} className="space-y-6">
        <TabsList className="relative w-full overflow-hidden">
          <div
            className={`pointer-events-none absolute top-1 bottom-1 left-1 rounded-[12px] bg-[#d4f5b6] w-[calc((100%-0.5rem)/3)] transition-transform duration-300 ease-out will-change-transform ${activeTab === 'manage' ? 'translate-x-0' : activeTab === 'import' ? 'translate-x-full' : 'translate-x-[200%]'}`}
            aria-hidden
          />
          <TabsTrigger value="manage" className="flex-1 relative z-10 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent">{t('kasper.friends.tabs.manage')}</TabsTrigger>
          <TabsTrigger value="import" className="flex-1 relative z-10 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent">{t('kasper.friends.tabs.import')}</TabsTrigger>
          <TabsTrigger value="assign" className="flex-1 relative z-10 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent">{t('kasper.friends.tabs.assign')}</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('kasper.friends.import.title')}
              </CardTitle>
              <CardDescription className="hidden md:block text-[#000000A6] dark:text-[#FFFFFFA6]">
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
              <CardDescription className="hidden md:block text-[#000000A6] dark:text-[#FFFFFFA6]">
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{t('kasper.friends.manage.title')}</CardTitle>
                  <CardDescription className="hidden md:block text-[#000000A6] dark:text-[#FFFFFFA6]">
                    {t('kasper.friends.manage.description')}
                  </CardDescription>
                </div>
                
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search codes, customers..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id}
                          className={header.column.columnDef.meta?.className}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow 
                        key={row.id} 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setEditingCode(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id}
                            className={cell.column.columnDef.meta?.className}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              <TablePagination table={table} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditUsageDialog
        isOpen={!!editingCode}
        onClose={() => setEditingCode(null)}
        codeData={editingCode}
        onUpdate={fetchData}
      />
    </div>
  );
};

export default AdminPromotionalCodes;