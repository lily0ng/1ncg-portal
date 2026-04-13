import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'../ui/Table';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'../ui/DropdownMenu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../ui/Select';
import {
  Search,
  MoreVertical,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown } from
'lucide-react';
import { motion } from 'framer-motion';
export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
}
export function DataTable<
  T extends {
    id: string | number;
  }>(
{
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search...',
  onRowClick,
  actions
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(
    new Set()
  );
  // Filter
  const filteredData = useMemo(() => {
    if (!searchKey || !searchTerm) return data;
    return data.filter((item) => {
      const val = item[searchKey as keyof T];
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchKey, searchTerm]);
  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);
  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === 'asc')
        return {
          key,
          direction: 'desc'
        };
        return null;
      }
      return {
        key,
        direction: 'asc'
      };
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((item) => item.id)));
    }
  };
  const toggleSelect = (id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {searchKey &&
          <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8" />
            
            </div>
          }
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedIds.size > 0 &&
          <span className="text-sm text-muted-foreground mr-2">
              {selectedIds.size} selected
            </span>
          }
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={
                  selectedIds.size === paginatedData.length &&
                  paginatedData.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all" />
                
              </TableHead>
              {columns.map((col, i) =>
              <TableHead
                key={i}
                className={
                col.sortable !== false ?
                'cursor-pointer select-none hover:bg-muted/50' :
                ''
                }
                onClick={() =>
                col.sortable !== false &&
                handleSort(col.accessorKey as string)
                }>
                
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false &&
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  }
                  </div>
                </TableHead>
              )}
              {actions && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ?
            <TableRow>
                <TableCell
                colSpan={columns.length + (actions ? 2 : 1)}
                className="h-24 text-center">
                
                  No results found.
                </TableCell>
              </TableRow> :

            paginatedData.map((item, index) =>
            <motion.tr
              key={item.id}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.2,
                delay: index * 0.05
              }}
              className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={(e) => {
                // Don't trigger row click if clicking checkbox or actions
                if ((e.target as HTMLElement).closest('.no-row-click'))
                return;
                onRowClick?.(item);
              }}>
              
                  <TableCell className="text-center no-row-click">
                    <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => toggleSelect(item.id)}
                  aria-label={`Select row`} />
                
                  </TableCell>
                  {columns.map((col, i) =>
              <TableCell key={i}>
                      {col.cell ?
                col.cell(item) :
                String(item[col.accessorKey as keyof T] || '')}
                    </TableCell>
              )}
                  {actions &&
              <TableCell className="no-row-click">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions(item)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
              }
                </motion.tr>
            )
            }
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-muted-foreground">
            Rows per page
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}>
            
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50].map((size) =>
              <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}>
              
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}>
              
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>);

}