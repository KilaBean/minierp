import { POSSidebarWidth } from "@/components/pos/POSSidebarOffset";

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <POSSidebarWidth />
      {children}
    </>
  );
}
