'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  pageSize?: number
  rowActions?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
  bulkActions?: React.ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  searchable = true,
  pageSize = 10,
  rowActions,
  onRowClick,
  bulkActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  const filteredData = data.filter((row) =>
    search
      ? JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
      : true
  )

  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const aVal = (a as any)[sortConfig.key]
        const bVal = (b as any)[sortConfig.key]
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    : filteredData

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  }

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => row.id)))
    }
  }

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedRows)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedRows(newSet)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {bulkActions && selectedRows.size > 0 && (
            <div className="mr-4">{bulkActions}</div>
          )}
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider',
                      column.sortable && 'cursor-pointer hover:text-white'
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                ))}
                {rowActions && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-slate-500">
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'border-b border-slate-800/50 last:border-0',
                      onRowClick && 'cursor-pointer hover:bg-slate-800/30'
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-slate-300">
                        {column.cell(row)}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {rowActions(row)}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <div className="text-sm text-slate-400">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-400">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-50"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
