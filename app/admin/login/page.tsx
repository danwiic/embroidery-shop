import { redirect } from "next/navigation";

const AdminLoginRedirect = () => {
  redirect("/login");
};

export default AdminLoginRedirect;
