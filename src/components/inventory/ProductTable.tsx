"use client";

import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, ColumnDef, SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown, ArrowUp, ArrowDown,
  Pencil, Trash2, BarChart2, Package, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils/index";
import { cn } from "@/lib/utils";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { StockAdjustDialog } from "./StockAdjustDialog";

interface Props {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
  currency?: string;
  onPageChange: (p: number) => void;
}

export function ProductTable({ data, total, page, totalPages, currency = "USD", onPageChange }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortButton label="Product" column={column} />
      ),
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              {p.image_url
                ? <img src={p.image_url} alt={p.name} className="w-9 h-9 rounded-xl object-cover" />
                : <Package size={16} className="text-muted-foreground" />
              }
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
              {p.sku && <div className="text-xs text-muted-foreground">{p.sku}</div>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.category?.name ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <SortButton label="Price" column={column} />,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {formatCurrency(row.original.price, currency)}
        </span>
      ),
    },
    {
      accessorKey: "cost_price",
      header: "Cost",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatCurrency(row.original.cost_price, currency)}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => <SortButton label="Stock" column={column} />,
      cell: ({ row }) => {
        const p  = row.original;
        const low = p.quantity <= p.low_stock_threshold;
        const out = p.quantity === 0;
        return (
          <span className={cn(
            "inline-flex items-center gap-1 text-sm font-semibold",
            out ? "text-red-500" : low ? "text-amber-500" : "text-foreground"
          )}>
            {p.quantity}
            {low && !out && <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">Low</span>}
            {out && <span className="text-[10px] bg-red-500/15 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">Out</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full font-medium",
          row.original.is_active
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "bg-muted text-muted-foreground"
        )}>
          {row.original.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => setAdjustProduct(p)}
              title="Adjust stock"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <BarChart2 size={15} />
            </button>
            <Link
              href={`/dashboard/inventory/${p.id}`}
              title="Edit product"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <Pencil size={15} />
            </Link>
            <button
              onClick={() => setDeleteId(p.id)}
              title="Delete product"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border">
                  {hg.headers.map((header) => (
                    <th key={header.id} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-muted-foreground text-sm">
                    <Package size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                    No products found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {total} product{total !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DeleteProductDialog
        productId={deleteId}
        onClose={() => setDeleteId(null)}
      />
      <StockAdjustDialog
        product={adjustProduct}
        onClose={() => setAdjustProduct(null)}
      />
    </>
  );
}

function SortButton({ label, column }: { label: string; column: any }) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={() => column.toggleSorting(sorted === "asc")}
      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
    >
      {label}
      {sorted === "asc"  ? <ArrowUp size={12} /> :
       sorted === "desc" ? <ArrowDown size={12} /> :
       <ArrowUpDown size={12} className="opacity-40" />}
    </button>
  );
}
