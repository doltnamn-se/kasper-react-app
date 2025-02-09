
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerWithProfile } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CustomerDetails } from "@/components/admin/CustomerDetails";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, Columns3, ListFilter } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CustomerTableProps {
  customers: CustomerWithProfile[];
  onlineUsers: Set<string>;
  lastSeen: Record<string, string>;
}

export const CustomerTable = ({ customers, onlineUsers, lastSeen }: CustomerTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<CustomerWithProfile>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "profile.display_name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-medium">
            {row.original.profile?.display_name || 'No name'}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.profile?.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "checklist_completed",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.checklist_completed ? "default" : "secondary"}>
          {row.original.checklist_completed ? 'Completed' : 'In Progress'}
        </Badge>
      ),
    },
    {
      id: "online_status",
      header: "Online Status",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Badge variant={onlineUsers.has(row.original.profile?.id || '') ? "default" : "secondary"}>
            {onlineUsers.has(row.original.profile?.id || '') ? 'Online' : 'Offline'}
          </Badge>
          {!onlineUsers.has(row.original.profile?.id || '') && lastSeen[row.original.profile?.id || ''] && (
            <div className="text-xs text-muted-foreground">
              Last seen: {format(new Date(lastSeen[row.original.profile?.id || '']), 'MMM d, HH:mm')}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "customer_type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.customer_type}</span>
      ),
    },
    {
      accessorKey: "subscription_plan",
      header: "Plan",
      cell: ({ row }) => (
        <span>
          {row.original.subscription_plan 
            ? row.original.subscription_plan.replace('_', ' ') 
            : 'No plan'}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        format(new Date(row.original.created_at), 'MMM d, yyyy')
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <CustomerDetails customer={row.original} />,
    },
  ];

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Filter customers..."
            value={(table.getColumn("profile.display_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("profile.display_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Columns3 className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "flex items-center gap-2 cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="h-4 w-4" />,
                          desc: <ChevronDown className="h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
      </div>
    </div>
  );
};
