import { CustomerNav } from "@/components/customer-nav";
import { SiteFooter } from "@/components/site-footer";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface relative">
      <CustomerNav />
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4">{children}</main>
      <SiteFooter />
    </div>
  );
}

export default CustomerLayout;
