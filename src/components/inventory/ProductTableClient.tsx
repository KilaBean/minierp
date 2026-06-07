"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProductTable } from "./ProductTable";
import { Product } from "@/types";

interface Props {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
  currency?: string;
}

export function ProductTableClient({ data, total, page, totalPages, currency }: Props) {
  const router     = useRouter();
  const pathname   = usePathname();
  const params     = useSearchParams();

  function handlePageChange(p: number) {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <ProductTable
      data={data}
      total={total}
      page={page}
      totalPages={totalPages}
      currency={currency}
      onPageChange={handlePageChange}
    />
  );
}
