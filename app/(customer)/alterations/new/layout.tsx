import { AlterationWizardProvider } from "@/lib/contexts/alteration-wizard";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <AlterationWizardProvider>{children}</AlterationWizardProvider>
);

export default Layout;
