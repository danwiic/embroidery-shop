import { CustomerNav } from "@/components/customer-nav";


const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-surface relative">
      <CustomerNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4">{children}</main>
    </div>
  );
}

export default CustomerLayout;
