'use client'

import { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Settings2, Search } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  searchColumn?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  searchColumn,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          {searchColumn && (
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                }
                className="pl-9 h-9 lg:h-10 text-sm"
              />
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0 touch-manipulation">
              <Settings2 className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:inline">Colunas</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value: boolean) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs lg:text-sm whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="touch-manipulation"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs lg:text-sm">
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
                  className="h-20 lg:h-24 text-center text-sm"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs lg:text-sm text-muted-foreground order-2 sm:order-1">
          {table.getFilteredSelectedRowModel().rows.length > 0 ? (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} de{' '}
              {table.getFilteredRowModel().rows.length} linha(s) selecionada(s)
            </span>
          ) : (
            <span>
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} de{' '}
              {table.getFilteredRowModel().rows.length} item(s)
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3 order-1 sm:order-2">
          <div className="hidden sm:flex items-center gap-2">
            <p className="text-xs lg:text-sm font-medium whitespace-nowrap">Linhas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value: string) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0 lg:h-9 lg:w-auto lg:px-3 touch-manipulation"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only lg:not-sr-only lg:ml-1">Anterior</span>
            </Button>
            <div className="text-xs lg:text-sm font-medium px-2 whitespace-nowrap">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0 lg:h-9 lg:w-auto lg:px-3 touch-manipulation"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only lg:not-sr-only lg:ml-1">Próximo</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
